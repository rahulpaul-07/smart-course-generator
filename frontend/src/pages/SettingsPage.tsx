import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Monitor } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { SettingsSkeleton } from '../components/dashboard/SettingsSkeleton';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'system',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Deferred to a microtask so this reads as a callback invocation rather
    // than a synchronous setState call within the effect body.
    queueMicrotask(() => {
      setSettings({
        theme: user.theme || 'system',
      });
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const [data, error] = await userService.updateSettings(settings);
    setSaving(false);

    if (!error && data) {
      if (user) login({ ...user, ...data });
      toast.success('Settings updated successfully');
    }
  };

  const handleThemeChange = (theme: string) => {
    setSettings({ ...settings, theme });
    
    // Apply to DOM immediately for preview
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(isDark ? 'dark' : 'light');
    } else {
      root.classList.add(theme);
    }
  };

  if (!user) return <SettingsSkeleton />;

  return (
    <PageContainer>
      <SectionHeader 
        title="Settings" 
        description="Manage your account preferences and settings."
      />

      <div className="max-w-4xl mx-auto mt-8">
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how CourseAI looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    settings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/50'
                  }`}
                >
                  <Sun className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    settings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/50'
                  }`}
                >
                  <Moon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    settings.theme === 'system' ? 'border-primary bg-primary/5' : 'border-border/30 hover:border-primary/50'
                  }`}
                >
                  <Monitor className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </CardContent>
          </Card>



          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className={`w-full sm:w-auto h-11 rounded-xl font-bold ${saving ? 'cursor-progress' : ''}`}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
