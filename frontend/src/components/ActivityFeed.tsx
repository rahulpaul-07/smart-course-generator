import { useState, useEffect } from 'react';
import { formatTimeDistance } from '../utils/dates';
import { Activity, BookOpen, Award, PlusCircle, Trophy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { collabService } from '../services/collabService';
import { EmptyState } from './ui/EmptyState';
import { Activity as ActivityIcon } from 'lucide-react';
export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    collabService.getActivity()
      .then(([data]) => {
        if (data) setActivities(data as any);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4 p-4"><div className="rounded-full bg-muted h-10 w-10"></div><div className="flex-1 space-y-4 py-1"><div className="h-2 bg-muted rounded w-3/4"></div><div className="space-y-2"><div className="h-2 bg-muted rounded"></div></div></div></div>;
  }

  if (activities.length === 0) {
    return (
      <EmptyState 
        icon={ActivityIcon}
        title="No Recent Activity" 
        description="There is no recent activity to show in your network yet. Check back later."
      />
    );
  }

  const getIcon = (action) => {
    switch (action) {
      case 'COMPLETED_COURSE': return <Trophy className="h-4 w-4 text-emerald-400" />;
      case 'PUBLISHED_COURSE': return <BookOpen className="h-4 w-4 text-brand-400" />;
      case 'UNLOCKED_ACHIEVEMENT': return <Award className="h-4 w-4 text-purple-400" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessage = (activity) => {
    const userName = activity.userId?.name || 'Someone';
    switch (activity.action) {
      case 'COMPLETED_COURSE': 
        return <><Link to={`/profile/${activity.userId?._id}`} className="font-semibold text-foreground cursor-pointer hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm">{userName}</Link> completed the course <span className="text-emerald-300">"{activity.metadata?.title}"</span></>;
      case 'PUBLISHED_COURSE':
        return <><Link to={`/profile/${activity.userId?._id}`} className="font-semibold text-foreground cursor-pointer hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm">{userName}</Link> published <Link to="/community" className="text-brand-300 cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm">"{activity.metadata?.title}"</Link></>;
      case 'UNLOCKED_ACHIEVEMENT':
        return <><Link to={`/profile/${activity.userId?._id}`} className="font-semibold text-foreground cursor-pointer hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm">{userName}</Link> unlocked <span className="text-purple-300 font-bold">{activity.metadata?.name}</span></>;
      default:
        return <><Link to={`/profile/${activity.userId?._id}`} className="font-semibold text-foreground cursor-pointer hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm">{userName}</Link> was active.</>;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity._id} className="flex gap-4 p-3 rounded-xl hover:bg-foreground/10 transition-colors">
          <div className="shrink-0 mt-0.5">
            <Link to={`/profile/${activity.userId?._id}`} className="h-8 w-8 rounded-full bg-card flex items-center justify-center cursor-pointer overflow-hidden border border-border/30 hover:border-brand-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              {activity.userId?.avatar ? (
                <img src={activity.userId.avatar} alt={`${activity.userId?.name || 'User'}'s Avatar`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-foreground">{activity.userId?.name?.[0] || '?'}</span>
              )}
            </Link>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-foreground/90 leading-tight">
              {getMessage(activity)}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5 bg-card px-2 py-0.5 rounded-full border border-border/30">
                {getIcon(activity.action)}
                <span className="capitalize">{activity.action.split('_').join(' ').toLowerCase()}</span>
              </span>
              <span>•</span>
              <span className="uppercase tracking-wider text-[10px]">{formatTimeDistance(activity.createdAt)}</span>
              
              {activity.xpEarned > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">+{activity.xpEarned} XP</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
