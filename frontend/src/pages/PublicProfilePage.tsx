import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Flame, Clock, BookOpen, Star, Copy, Heart, Zap, Award } from 'lucide-react';
import { collabService, type PublicProfileResponse } from '../services/collabService';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/skeleton';

function PublicProfileSkeleton() {
  return (
    <div className="page-shell max-w-5xl mx-auto">
      <div className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <Skeleton className="h-32 w-32 rounded-full shrink-0" />
          <div className="text-center md:text-left flex-grow w-full">
            <Skeleton className="h-8 w-56 rounded-md mx-auto md:mx-0" />
            <Skeleton className="h-4 w-full max-w-md rounded-md mt-3 mx-auto md:mx-0" />
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-32 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <Skeleton className="h-5 w-32 rounded-md mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded-md" />
                    <Skeleton className="h-3 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <Skeleton className="h-5 w-44 rounded-md mb-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-5">
                <Skeleton className="h-4 w-3/4 rounded-md mb-3" />
                <Skeleton className="h-3 w-full rounded-md mb-2" />
                <Skeleton className="h-3 w-2/3 rounded-md mb-4" />
                <div className="flex items-center justify-between border-t border-border/30 pt-3">
                  <Skeleton className="h-3 w-10 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    collabService.getPublicProfile(userId!)
      .then(([data, fetchError]) => {
        if (fetchError) setError(fetchError);
        else setProfileData(data);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <PublicProfileSkeleton />;
  
  if (error || !profileData) {
    return (
      <div className="page-shell py-20 text-center">
        <h2 className="text-xl font-bold text-foreground mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">{error || 'This user does not exist or their profile is private.'}</p>
        <button 
          onClick={() => navigate('/community')}
          className="mt-6 text-brand-400 hover:text-brand-300 transition-colors"
        >
          Return to Community
        </button>
      </div>
    );
  }

  const { user, courses } = profileData;

  return (
    <div className="page-shell max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-500/20 to-primary/20"></div>
        
        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 mt-12">
          <div className="h-32 w-32 rounded-full bg-card border-4 border-border flex items-center justify-center text-4xl text-foreground font-bold shadow-lg overflow-hidden shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name?.[0] || '?'
            )}
          </div>
          
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-3xl font-display font-bold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">{user.bio || 'This learner prefers to keep an air of mystery.'}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/10 border border-border/30 text-sm">
                <Zap className="h-4 w-4 text-warning" />
                <span className="text-foreground font-bold">{user.xp || 0}</span>
                <span className="text-muted-foreground text-xs uppercase tracking-wider">XP</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/10 border border-border/30 text-sm">
                <Flame className="h-4 w-4 text-destructive" />
                <span className="text-foreground font-bold">{user.studyStreak || 0}</span>
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Day Streak</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/10 border border-border/30 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-foreground font-bold">{Math.floor((user.totalStudyMinutes || 0) / 60)}</span>
                <span className="text-muted-foreground text-xs uppercase tracking-wider">Hours Studied</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar: Achievements */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Achievements
            </h3>
            
            {(!user.achievements || user.achievements.length === 0) ? (
              <EmptyState
                icon={Trophy}
                title="No Achievements"
                description="No achievements unlocked yet."
                className="min-h-[150px] bg-transparent border-none p-2"
              />
            ) : (
              <div className="space-y-4">
                {user.achievements.map((ach) => (
                  <div key={ach.badge} className="flex gap-3 items-start bg-foreground/10 p-3 rounded-xl border border-border/30">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">{ach.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content: Published Courses */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-brand-400" /> Published Courses
          </h3>
          
          {courses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Courses"
              description="This user hasn't published any courses yet."
              className="bg-card/10 border-border/30 min-h-[250px]"
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {courses.map(course => (
                <div key={course._id} className="glass-card flex flex-col rounded-xl p-5 hover:border-brand-500/30 transition-colors">
                  <h4 className="font-bold text-foreground line-clamp-1">{course.title}</h4>
                  <p className="mt-2 text-xs text-muted-foreground flex-grow line-clamp-2">
                    {course.description || "No description provided."}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                      <span className="text-xs text-foreground/90 font-medium">{(course.averageRating || 0).toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="h-3.5 w-3.5" /> {course.upvotesCount || 0}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Copy className="h-3.5 w-3.5" /> {course.clonesCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
