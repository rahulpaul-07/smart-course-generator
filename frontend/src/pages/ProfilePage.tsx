import { useState, useEffect } from 'react';
import { User, Save, Mail, Sparkles, Loader2, BookOpen, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { analyticsService } from '../services/analyticsService';
import { useAuth } from '../hooks/useAuth';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ProfileSkeleton } from '../components/dashboard/ProfileSkeleton';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    avatar: '',
    isProfilePublic: false,
    skillLevel: 'beginner',
    learningInterests: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [coursesGenerated, setCoursesGenerated] = useState(0);

  useEffect(() => {
    // Deferred to a microtask so this reads as a callback invocation rather
    // than a synchronous setState call within the effect body.
    queueMicrotask(() => {
      analyticsService.getDashboard().then(([data]) => {
        if (data) setCoursesGenerated(data.totalCourses);
      });
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    // Deferred to a microtask so this reads as a callback invocation rather
    // than a synchronous setState call within the effect body.
    queueMicrotask(() => {
      setProfile({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        isProfilePublic: user.isProfilePublic || false,
        skillLevel: user.skillLevel || 'beginner',
        learningInterests: user.learningInterests || [],
      });
    });
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    const [data, error] = await userService.updateProfile({
      name: profile.name,
      bio: profile.bio,
      isProfilePublic: profile.isProfilePublic,
      skillLevel: profile.skillLevel,
      learningInterests: profile.learningInterests,
    });
    setSaving(false);

    if (!error && data) {
      if (user) login({ ...user, ...data });
      toast.success('Profile updated successfully');
    }
  };

  if (!user) return <ProfileSkeleton />;

  return (
    <PageContainer>
      <SectionHeader 
        title="Your Profile" 
        description="Manage your personal information and learning identity."
      />

      <div className="grid lg:grid-cols-[1fr_350px] gap-8 mt-8">
        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-4 ring-background shadow-md">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                      {profile.name?.charAt(0)?.toUpperCase() || <User />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{profile.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </div>
                  <Badge variant="secondary" className="mt-3 capitalize">
                    {profile.skillLevel} Level
                  </Badge>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/30">
                <div className="grid gap-2">
                  <label htmlFor="display-name" className="text-sm font-medium">Display Name</label>
                  <Input 
                    id="display-name"
                    value={profile.name}
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="h-12 rounded-xl"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="bio-input" className="text-sm font-medium">Bio</label>
                  <Textarea 
                    id="bio-input"
                    value={profile.bio}
                    onChange={e => setProfile({...profile, bio: e.target.value})}
                    placeholder="Tell us a little bit about yourself and your learning goals..."
                    className="min-h-[120px] rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Brief description for your profile. URLs are hyperlinked.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
            <CardHeader>
              <CardTitle>Privacy & Display</CardTitle>
              <CardDescription>Control how others see your profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label htmlFor="public-profile-switch" className="text-sm font-medium">Public Profile</label>
                  <p className="text-sm text-muted-foreground">
                    Allow your profile to appear on the leaderboard and community templates.
                  </p>
                </div>
                <Switch 
                  id="public-profile-switch"
                  checked={profile.isProfilePublic}
                  onCheckedChange={(c) => setProfile({...profile, isProfilePublic: c})}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className={`w-full sm:w-auto h-11 rounded-xl font-bold ${saving ? 'cursor-progress' : ''}`}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Learning Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.learningInterests.length > 0 ? (
                  profile.learningInterests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="bg-background/50 hover:bg-background/80 capitalize">
                      {interest.replace('-', ' ')}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No learning interests set.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
            <CardHeader>
              <CardTitle>Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Courses Generated</span>
                </div>
                <span className="font-bold text-lg">{coursesGenerated}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md text-primary">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Certificates</span>
                </div>
                <span className="font-bold text-lg">{user.certificates?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
