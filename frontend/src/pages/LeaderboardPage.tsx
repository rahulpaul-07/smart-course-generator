import { useState, useEffect } from 'react';
import { Trophy, Flame, Zap, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/collab/leaderboard')
      .then(res => setLeaders(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-shell py-20"><LoadingSpinner /></div>;

  return (
    <div className="page-shell">
      <section className="mb-10 text-center">
        <p className="eyebrow flex justify-center"><Trophy className="h-3.5 w-3.5" /> Hall of Fame</p>
        <h1 className="gradient-text mt-3 font-display text-4xl font-extrabold">Top Learners</h1>
        <p className="mt-2 text-sm text-muted-foreground">Compete with the community and climb the ranks.</p>
      </section>

      <div className="max-w-4xl mx-auto glass-card rounded-2xl overflow-hidden">
        <div className="p-4 bg-foreground/10 border-b border-border/ grid grid-cols-12 gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider hidden sm:grid">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5">Learner</div>
          <div className="col-span-3">Achievements</div>
          <div className="col-span-2 text-right pr-4">Total XP</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {leaders.map((user, idx) => (
            <div 
              key={user._id} 
              onClick={() => navigate(`/profile/${user._id}`)}
              className="p-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center hover:bg-foreground/10 transition-colors cursor-pointer group"
            >
              <div className="col-span-2 flex items-center justify-between sm:justify-center">
                <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">Rank</span>
                {idx === 0 ? <Trophy className="h-8 w-8 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] transform group-hover:scale-110 transition-transform" /> :
                 idx === 1 ? <Trophy className="h-7 w-7 text-foreground/90 drop-shadow-md transform group-hover:scale-110 transition-transform" /> :
                 idx === 2 ? <Trophy className="h-6 w-6 text-amber-600 drop-shadow-md transform group-hover:scale-110 transition-transform" /> :
                 <span className="font-display font-bold text-lg text-muted-foreground">#{idx + 1}</span>}
              </div>
              
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-12 w-12 rounded-full -white font-bold shadow-lg overflow-hidden border border-border/ group-hover:border-brand-400/50 transition-colors">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    user.name?.[0] || '?'
                  )}
                </div>
                <div>
                  <span className="font-medium text-foreground group-hover:text-brand-300 transition-colors block">{user.name || 'Anonymous'}</span>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-orange-400 mt-0.5">
                    <Flame className="h-3 w-3" /> {user.studyStreak || 0} day streak
                  </div>
                </div>
              </div>
              
              <div className="col-span-3 flex flex-wrap items-center gap-2">
                {user.achievements?.slice(0, 4).map((ach) => (
                  <div key={ach.badge} title={ach.name} className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Award className="h-4 w-4 text-indigo-400" />
                  </div>
                ))}
                {(user.achievements?.length || 0) > 4 && (
                  <span className="text-xs text-muted-foreground">+{user.achievements.length - 4}</span>
                )}
              </div>
              
              <div className="col-span-2 flex items-center justify-between sm:justify-end gap-2 pr-2">
                <span className="sm:hidden text-xs font-bold text-muted-foreground uppercase tracking-wider">XP</span>
                <div className="flex items-center gap-1.5 font-display text-xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors drop-shadow-sm">
                  <Zap className="h-5 w-5 fill-amber-400/20" /> 
                  {user.xp || 0}
                </div>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
              No public profiles found on the leaderboard.<br/>Be the first to join the Hall of Fame!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
