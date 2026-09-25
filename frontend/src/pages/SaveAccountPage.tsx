import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';

/** Convert a guest account into a regular one without losing anything. */
export default function SaveAccountPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (user && !user.isDemo) return <Navigate to="/dashboard" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const [data] = await authService.claim({ name, email, password });
    setSaving(false);
    if (data) {
      login(data);
      toast.success('Account saved. Everything you made is still here.');
      navigate('/dashboard');
    }
  }

  return (
    <PageContainer width="narrow">
      <div className="mx-auto max-w-md">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Keep your progress</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Add an email and password and this guest account becomes yours: courses, progress and XP carry over.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="save-name" className="text-sm font-medium">Full name</label>
            <Input id="save-name" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="save-email" className="text-sm font-medium">Email</label>
            <Input id="save-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label htmlFor="save-password" className="text-sm font-medium">Password</label>
            <Input id="save-password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl" />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save account
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
