import { useState, useEffect } from 'react';
import { Globe, Heart, Copy, Star, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collabService } from '../services/collabService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/button';

export default function CommunityTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cloningId, setCloningId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = () => {
    collabService.getTemplates()
      .then(([data]) => setTemplates((data as any) || []))
      .finally(() => setLoading(false));
  };

  const handleUpvote = async (courseId) => {
    // Optimistic UI Update
    setTemplates(prev => prev.map(t => 
      t._id === courseId 
        ? { ...t, upvotesCount: (t.upvotesCount || 0) + 1, hasUpvoted: true } 
        : t
    ));
    const [data, error] = await collabService.upvoteTemplate(courseId);
    if (data) {
      setTemplates(prev => prev.map(t => 
        t._id === courseId ? { ...t, upvotesCount: (data as any).upvotesCount } : t
      ));
    } else if (error) {
      setTemplates(prev => prev.map(t => 
        t._id === courseId 
          ? { ...t, upvotesCount: Math.max(0, (t.upvotesCount || 1) - 1), hasUpvoted: false } 
          : t
      ));
    }
  };

  const handleRate = async (courseId, rating) => {
    const [data] = await collabService.rateTemplate(courseId, rating);
    if (data) {
      setTemplates(templates.map(t => t._id === courseId ? { ...t, averageRating: (data as any).averageRating } : t));
    }
  };

  const handleClone = async (courseId) => {
    setCloningId(courseId);
    const [data] = await collabService.cloneTemplate(courseId);
    if (data) {
      navigate(`/course/${(data as any).courseId}`);
    } else {
      setCloningId(null);
    }
  };

  if (loading) return <div className="page-shell py-20"><LoadingSpinner /></div>;

  return (
    <div className="page-shell">
      <section className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow"><Globe className="h-3.5 w-3.5" /> Community</p>
          <h1 className="gradient-text mt-3 font-display text-3xl font-extrabold">Course Marketplace</h1>
          <p className="mt-2 text-sm text-muted-foreground">Discover, clone, and rate courses created by the community.</p>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(template => (
          <div key={template._id} className="glass-card flex flex-col rounded-2xl p-5 relative overflow-hidden group hover:border-brand-500/30 transition-colors">
            {template.isFeatured && (
              <div className="absolute top-0 right-0 -white px-3 py-1 rounded-bl-xl shadow-lg">
                FEATURED
              </div>
            )}
            
            <div className="flex justify-between items-start mb-2 pr-16">
              <h3 className="font-display text-lg font-bold text-foreground line-clamp-2">{template.title}</h3>
            </div>
            
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => handleRate(template._id, star)}
                  className="focus:outline-none transition-transform hover:scale-125"
                >
                  <Star 
                    className={`h-3.5 w-3.5 ${(template.averageRating || 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} 
                  />
                </button>
              ))}
              <span className="text-xs text-muted-foreground ml-1">({(template.averageRating || 0).toFixed(1)})</span>
            </div>

            <p className="text-sm text-muted-foreground flex-grow line-clamp-3 mb-4">
              {template.description || "No description provided."}
            </p>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 rounded bg-foreground/10 text-[10px] font-medium text-foreground/90 border border-border/ uppercase">
                {template.language || 'English'}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t border-border/ pt-4 mb-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/profile/${template.creator?._id}`)}>
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs text-foreground overflow-hidden shadow-inner">
                  {template.creator?.avatar ? (
                    <img src={template.creator.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    template.creator?.name?.[0] || '?'
                  )}
                </div>
                <span className="text-xs font-medium text-foreground/90 hover:text-foreground transition-colors">
                  {template.creator?.name || 'Anonymous'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleUpvote(template._id)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-pink-400 transition-colors"
                >
                  <Heart className="h-4 w-4" /> {template.upvotesCount}
                </button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Copy className="h-4 w-4" /> {template.clonesCount}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleClone(template._id)}
              disabled={cloningId === template._id}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-300 transition hover:bg-brand-500/20 disabled:opacity-50"
            >
              {cloningId === template._id ? (
                <LoadingSpinner text="Cloning..." size="sm" />
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Clone Course
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      {templates.length === 0 && (
        <EmptyState
          icon={Globe}
          title="No Community Courses Yet"
          description="Be the first to publish a course and share it with the community!"
          action={
            <Button onClick={() => navigate('/dashboard')}>
              Create Course
            </Button>
          }
        />
      )}
    </div>
  );
}
