import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, LayoutGrid, List, PlayCircle, 
  MoreVertical, Clock, Sparkles, AlertCircle, Calendar, Star, 
  CheckCircle2, ArrowRight, Book, Layers, Trash2, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import api from '../utils/api';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Opened');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const savedView = localStorage.getItem('course-view-preference');
    if (savedView === 'list' || savedView === 'grid') {
      setViewMode(savedView);
    }
  }, []);

  const handleViewChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('course-view-preference', mode);
  };

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['myCourses'],
    queryFn: async () => {
      const res = await api.get('/courses/mine');
      return res.data || [];
    }
  });

  const filters = ['All', 'In Progress', 'Completed', 'Favorites', 'Recently Viewed', 'Difficulty'];
  const sorts = ['Recently Opened', 'Recently Created', 'Alphabetical', 'Progress'];

  const filteredCourses = courses?.filter((course: any) => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    const progress = course.progress || (course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.filter((l: any) => l.completedAt)?.length || 0), 0) || 0) / (course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 1) * 100;
    const isCompleted = progress >= 100;
    const isInProgress = progress > 0 && progress < 100;

    if (filter === 'In Progress' && !isInProgress) return false;
    if (filter === 'Completed' && !isCompleted) return false;
    if (filter === 'Favorites' && !course.isFavorite) return false;
    // Recently Viewed could be simulated by checking updated date vs current date, but for now we'll just show all since no backend flag exists
    if (filter === 'Difficulty' && (!course.difficulty || course.difficulty === 'Unknown')) return false;

    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'Recently Created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'Progress') return (b.progress || 0) - (a.progress || 0);
    // Default Recently Opened
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });

  const CourseCard = ({ course }: { course: any }) => {
    const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 12;
    const completedLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.filter((l: any) => l.completedAt)?.length || 0), 0) || 0;
    const progress = course.progress || Math.round((completedLessons / Math.max(totalLessons, 1)) * 100);
    const difficulty = course.difficulty || 'Intermediate';
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`group relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/30 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-0' : 'flex flex-col'}`}
      >
        {/* Cover Thumbnail */}
        <div className={`relative bg-muted/30 border-b border-border/40 overflow-hidden shrink-0 flex items-center justify-center ${viewMode === 'list' ? 'w-full sm:w-[280px] sm:border-r sm:border-b-0' : 'h-40'}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent mix-blend-overlay group-hover:opacity-100 transition-opacity duration-200" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.15),transparent_50%)]" />
          
          <BookOpen className="h-12 w-12 text-primary/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-300" />
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-background/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm border border-border/50">
              <Sparkles className="h-3 w-3" /> AI
            </span>
            <span className="inline-flex items-center rounded-md bg-background/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm border border-border/50">
              {difficulty}
            </span>
          </div>

          <button className="absolute top-3 right-3 h-8 w-8 rounded-md bg-background/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background/90 border border-border/50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm">
            <MoreVertical className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Card Content */}
        <div className={`flex flex-col p-5 sm:p-6 flex-1 bg-card/20 ${viewMode === 'list' ? 'justify-between' : ''}`}>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description || `A comprehensive AI-generated learning experience covering the fundamentals of ${course.title}.`}
            </p>
          </div>

          <div className="mt-auto space-y-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {totalLessons} lessons</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~2.5 hours</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-semibold text-muted-foreground">Progress</span>
                <span className="text-sm font-extrabold text-foreground">{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-border/40 pt-4">
              <span className="text-xs font-medium text-muted-foreground w-full sm:w-auto">
                Opened {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
              </span>
              <Button 
                className="w-full sm:w-auto h-11 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] group/btn bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
                onClick={() => navigate(`/course/${course._id}`)}
              >
                {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review' : 'Continue'} 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <PageContainer className="relative z-10 pt-8 pb-24 space-y-8 max-w-7xl mx-auto">
        
        {/* 1. Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2 drop-shadow-sm">My Courses</h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium">Manage and continue your AI-generated learning journeys.</p>
          </div>
          
          <Button size="lg" className="rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 w-full md:w-auto shrink-0 bg-primary hover:bg-primary/90 font-bold" onClick={() => navigate('/roadmaps')}>
            Generate New Course <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>

        {/* 2. Controls Toolbar (Search & Filters) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-2xl p-4 shadow-sm flex flex-col xl:flex-row gap-4 items-center justify-between sticky top-20 z-30"
        >
          {/* Search */}
          <div className="relative w-full xl:w-[320px] shrink-0 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
            <Input 
              placeholder="Search your courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-11 rounded-xl bg-background/60 border-border/50 focus-visible:ring-2 focus-visible:ring-primary shadow-inner font-medium placeholder:text-muted-foreground/70 transition-all duration-200 hover:border-border/80"
              aria-label="Search courses"
            />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-none">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 md:pb-0 pr-2 md:pr-0 w-full md:w-auto">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3.5 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    filter === f 
                      ? 'bg-foreground text-background shadow-sm' 
                      : 'bg-transparent border border-border/40 text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-border/80'
                  }`}
                  aria-pressed={filter === f}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between w-full md:w-auto gap-3 shrink-0 border-t border-border/40 md:border-t-0 md:border-l md:pl-4 pt-4 md:pt-0">
              {/* Sort Dropdown */}
              <div className="relative flex items-center gap-2 border border-border/50 rounded-lg bg-background/60 px-3 h-10 hover:border-border/80 transition-colors duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <select 
                  className="bg-transparent text-[13px] font-bold text-foreground outline-none border-none focus:ring-0 cursor-pointer w-full appearance-none pr-6"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort courses"
                >
                  {sorts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* View Toggles */}
              <div className="flex bg-background/60 border border-border/50 rounded-lg p-1 shrink-0">
                <button 
                  onClick={() => handleViewChange('grid')}
                  className={`p-1.5 rounded-[5px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleViewChange('list')}
                  className={`p-1.5 rounded-[5px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Main Content Area */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className={`rounded-2xl border border-border/40 ${viewMode === 'grid' ? 'h-[420px]' : 'h-48'}`} />
            ))}
          </div>
        ) : isError ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 lg:p-20 bg-card/20 border border-border/40 rounded-[32px] backdrop-blur-xl text-center shadow-sm"
          >
            <div className="h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
              <AlertCircle className="h-8 w-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Unable to load courses</h3>
            <p className="text-muted-foreground mb-8 max-w-md font-medium leading-relaxed">
              There was a problem fetching your courses from the server. Please check your connection and try again.
            </p>
            <Button size="lg" className="rounded-xl shadow-sm active:scale-[0.98] transition-transform font-bold" onClick={() => window.location.reload()}>
              Retry Connection
            </Button>
          </motion.div>
        ) : filteredCourses?.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 lg:p-24 bg-card/20 border border-dashed border-border/60 rounded-[32px] backdrop-blur-sm text-center relative overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 h-24 w-24 bg-background/50 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 border border-border/40 shadow-sm shadow-primary/5">
              <BookOpen className="h-10 w-10 text-muted-foreground/60" />
              <Sparkles className="h-5 w-5 text-primary absolute -top-2 -right-2" />
            </div>
            
            <h3 className="text-3xl font-extrabold tracking-tight mb-4 relative z-10">
              {searchQuery || filter !== 'All' ? "No matches found" : "Your learning journey begins here"}
            </h3>
            <p className="text-lg text-muted-foreground mb-10 max-w-md font-medium leading-relaxed relative z-10">
              {searchQuery || filter !== 'All' 
                ? "Try adjusting your search criteria or clearing your active filters to find what you're looking for."
                : "Generate a fully personalized, AI-driven course in minutes and start acquiring new skills."}
            </p>
            
            {searchQuery || filter !== 'All' ? (
              <Button variant="outline" size="lg" className="rounded-xl font-bold active:scale-[0.98] transition-all relative z-10" onClick={() => { setSearchQuery(''); setFilter('All'); }}>
                Clear All Filters
              </Button>
            ) : (
              <Button size="lg" className="rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 bg-primary hover:bg-primary/90 font-bold px-8 h-12 relative z-10" onClick={() => navigate('/roadmaps')}>
                Generate Your First Course <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}
            >
              {filteredCourses.map((course: any) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </PageContainer>
    </div>
  );
}
