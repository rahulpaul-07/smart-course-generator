import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout, { GoogleIcon } from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const hasGoogleAuth = !!(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'dummy-google-client-id');

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, loginWithAuth0, hasAuth0Config } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setLoading(true);
      await loginWithGoogle(credentialResponse.credential);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup error', error);
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !email || !password) {
      toast.error('All fields are required.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    
    setLoading(true);

    const [data] = await authService.register({ name, email, password });
    if (data) {
      login(data);
      navigate('/dashboard');
    }
    setLoading(false);
  }

  return (
    <AuthLayout
      eyebrow="Create an account"
      title="Start your learning journey"
      description="Join CourseAI to generate unlimited personalized courses."
      footer={(
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary transition hover:text-primary/80">
            Sign in
          </Link>
        </>
      )}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl bg-background/50 backdrop-blur-[2px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4 shadow-lg" />
            <p className="text-sm font-medium text-foreground animate-pulse">Creating account...</p>
          </div>
        )}
        {hasGoogleAuth && (
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                toast.error('Google signup failed');
              }}
              theme="filled_black"
              shape="rectangular"
              text="signup_with"
              size="large"
            />
          </div>
        )}

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign up with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium leading-none">
                Password
              </label>
              <span className="text-xs text-muted-foreground">8+ characters</span>
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9 h-12 rounded-xl"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl mt-2 font-bold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
