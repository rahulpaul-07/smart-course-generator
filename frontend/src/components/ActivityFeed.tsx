import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity, BookOpen, Award, PlusCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/collab/activity')
      .then(res => setActivities(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse flex space-x-4 p-4"><div className="rounded-full bg-slate-700 h-10 w-10"></div><div className="flex-1 space-y-4 py-1"><div className="h-2 bg-slate-700 rounded w-3/4"></div><div className="space-y-2"><div className="h-2 bg-slate-700 rounded"></div></div></div></div>;
  }

  if (activities.length === 0) {
    return <div className="text-center py-8 text-slate-500 text-sm">No recent activity found.</div>;
  }

  const getIcon = (action) => {
    switch (action) {
      case 'COMPLETED_COURSE': return <Trophy className="h-4 w-4 text-emerald-400" />;
      case 'PUBLISHED_COURSE': return <BookOpen className="h-4 w-4 text-brand-400" />;
      case 'UNLOCKED_ACHIEVEMENT': return <Award className="h-4 w-4 text-purple-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const getMessage = (activity) => {
    const userName = activity.userId?.name || 'Someone';
    switch (activity.action) {
      case 'COMPLETED_COURSE': 
        return <><span className="font-semibold text-white cursor-pointer hover:text-brand-300" onClick={() => navigate(`/profile/${activity.userId?._id}`)}>{userName}</span> completed the course <span className="text-emerald-300">"{activity.metadata?.title}"</span></>;
      case 'PUBLISHED_COURSE':
        return <><span className="font-semibold text-white cursor-pointer hover:text-brand-300" onClick={() => navigate(`/profile/${activity.userId?._id}`)}>{userName}</span> published <span className="text-brand-300 cursor-pointer hover:underline" onClick={() => navigate('/community')}>"{activity.metadata?.title}"</span></>;
      case 'UNLOCKED_ACHIEVEMENT':
        return <><span className="font-semibold text-white cursor-pointer hover:text-brand-300" onClick={() => navigate(`/profile/${activity.userId?._id}`)}>{userName}</span> unlocked <span className="text-purple-300 font-bold">{activity.metadata?.name}</span></>;
      default:
        return <><span className="font-semibold text-white cursor-pointer hover:text-brand-300" onClick={() => navigate(`/profile/${activity.userId?._id}`)}>{userName}</span> was active.</>;
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity._id} className="flex gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
          <div className="shrink-0 mt-0.5">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center cursor-pointer overflow-hidden border border-slate-700 hover:border-brand-500/50 transition-colors" onClick={() => navigate(`/profile/${activity.userId?._id}`)}>
              {activity.userId?.avatar ? (
                <img src={activity.userId.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-white">{activity.userId?.name?.[0] || '?'}</span>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-300 leading-tight">
              {getMessage(activity)}
            </p>
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                {getIcon(activity.action)}
                <span className="capitalize">{activity.action.split('_').join(' ').toLowerCase()}</span>
              </span>
              <span>•</span>
              <span className="uppercase tracking-wider text-[10px]">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
              
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
