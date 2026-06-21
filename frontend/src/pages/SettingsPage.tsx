import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Moon, Sun, Monitor, Shield, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, login } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'system',
    notifications: {
      email: true,
      push: false,
      courseUpdates: true,
    }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setSettings({
        theme: user.theme || 'system',
        notifications: user.notifications || {
          email: true,
          push: false,
          courseUpdates: true,
        }
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/user/settings', settings);
      login({ ...user, ...data });
      toast.success('Settings updated successfully');
    } catch (e) {
      toast.error('Failed to update settings');
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (theme: string) => {
    setSettings({ ...settings, theme });
  };

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  if (!user) return null;

  return (
    <PageContainer>
      <SectionHeader 
        title="Settings" 
        description="Manage your account preferences and settings."
      />

      <div className="grid lg:grid-cols-[1fr_350px] gap-8 mt-8">
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
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
                    settings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Sun className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    settings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Moon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    settings.theme === 'system' ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50'
                  }`}
                >
                  <Monitor className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>Choose what updates you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <p className="text-sm text-muted-foreground">Receive weekly summaries and important updates.</p>
                </div>
                <Switch 
                  checked={settings.notifications.email}
                  onCheckedChange={() => toggleNotification('email')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Push Notifications</label>
                  <p className="text-sm text-muted-foreground">Get notified in your browser for study reminders.</p>
                </div>
                <Switch 
                  checked={settings.notifications.push}
                  onCheckedChange={() => toggleNotification('push')}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Course Updates</label>
                  <p className="text-sm text-muted-foreground">When new modules or practice labs are added.</p>
                </div>
                <Switch 
                  checked={settings.notifications.courseUpdates}
                  onCheckedChange={() => toggleNotification('courseUpdates')}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Preferences
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              <p className="text-xs text-muted-foreground">
                If you registered using Google, you don't have a password to change.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
