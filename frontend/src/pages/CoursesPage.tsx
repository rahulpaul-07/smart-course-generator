import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Search, Filter, LayoutGrid, List, PlayCircle, 
  MoreVertical, Clock, Sparkles, AlertCircle, Calendar, Star, 
  CheckCircle2, ArrowRight
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

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['myCourses'],
    queryFn: async () => {
      const res = await api.get('/courses/mine');
      return res.data || [];
    }
  });

  const filters = ['All', 'In Progress', 'Completed', 'Favorites'];
  const sorts = ['Recently Opened', 'Recently Created', 'Alphabetical', 'Progress'];

  const filteredCourses = courses?.filter((course: any) => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Calculate simple mock progress based on lessons if not available
    const progress = course.progress || (course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.filter((l: any) => l.completedAt)?.length || 0), 0) || 0) / (course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 1) * 100;
    const isCompleted = progress >= 100;
    const isInProgress = progress > 0 && progress < 100;

    if (filter === 'In Progress' && !isInProgress) return false;
    if (filter === 'Completed' && !isCompleted) return false;
    // Note: Favorites logic would require backend support, assuming false for now unless implemented
    if (filter === 'Favorites' && !course.isFavorite) return false;

    return true;
  }).sort((a: any, b: any) => {
    if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'Recently Created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'Progress') return (b.progress || 0) - (a.progress || 0);
    // Default Recently Opened (using updatedAt as proxy)
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className={`group relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-border/80 transition-all duration-250 ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-0' : 'flex flex-col'}`}
      >
        {/* Gradient Cover Header */}
        <div className={`relative bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border-b border-border/40 overflow-hidden ${viewMode === 'list' ? 'w-full sm:w-64 shrink-0 sm:border-r sm:border-b-0' : 'h-32'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.2),transparent_50%)]" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 shadow-sm">
              <Sparkles className="h-3 w-3" /> AI Generated
            </span>
            <span className="inline-flex items-center rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border border-border/50 shadow-sm">
              {difficulty}
            </span>
          </div>
          <button className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background/80 border border-border/50">
            <MoreVertical className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className={`flex flex-col p-6 flex-1 ${viewMode === 'list' ? 'justify-between' : ''}`}>
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
              {course.description || `A comprehensive AI-generated learning experience covering the fundamentals of ${course.title}.`}
            </p>
          </div>

          <div className="mt-auto space-y-6">
            {/* Progress Section */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {progress === 100 ? (
                    <span className="flex items-center gap-1.5 text-emerald-500 font-medium"><CheckCircle2 className="h-4 w-4" /> Completed</span>
                  ) : (
                    <span className="flex items-center gap-1.5"><PlayCircle className="h-4 w-4" /> {completedLessons}/{totalLessons} lessons</span>
                  )}
                </div>
                <span className="text-sm font-bold text-foreground">{progress}%</span>
              </div>
              <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/50">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-border/40 pt-4">
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground w-full sm:w-auto">
                <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> 2h 45m left</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Opened {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
              </div>
              <Button 
                className="w-full sm:w-auto rounded-xl shadow-md group/btn" 
                onClick={() => navigate(`/course/${course._id}`)}
              >
                {progress === 0 ? 'Start Course' : progress === 100 ? 'Review Course' : 'Continue'} 
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <PageContainer className="relative z-10 pt-8 pb-24 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2 drop-shadow-sm">My Courses</h1>
            <p className="text-lg text-muted-foreground">Manage and continue your AI-generated learning.</p>
          </div>
          
          <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all w-full md:w-auto shrink-0" onClick={() => navigate('/community')}>
            Generate New Course <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Controls Toolbar */}
        <div className="rounded-2xl border border-border/50 bg-card/20 backdrop-blur-xl p-4 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between sticky top-20 z-20">
          <div className="relative w-full lg:max-w-md shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search your courses..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 h-12 rounded-xl bg-background/50 border-border/50 focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <div className="flex bg-background/50 border border-border/50 rounded-xl p-1 shrink-0">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${filter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-2 border border-border/50 rounded-xl bg-background/50 px-3 h-12">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select 
                  className="bg-transparent text-sm font-medium text-foreground outline-none border-none focus:ring-0 cursor-pointer"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sorts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex bg-background/50 border border-border/50 rounded-xl p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Skeleton key={n} className={`rounded-2xl ${viewMode === 'grid' ? 'h-[380px]' : 'h-48'}`} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center p-16 bg-card/40 border border-border/50 rounded-3xl backdrop-blur-sm text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-2xl font-bold mb-2">Unable to load courses</h3>
            <p className="text-muted-foreground mb-6 max-w-md">There was a problem fetching your courses. Please check your connection and try again.</p>
            <Button size="lg" className="rounded-xl" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : filteredCourses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-card/20 border border-dashed border-border/60 rounded-3xl backdrop-blur-sm text-center">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 border border-border/50">
              <BookOpen className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No courses found</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              {searchQuery || filter !== 'All' 
                ? "Try adjusting your search or filters to find what you're looking for."
                : "You haven't generated any courses yet. Start your learning journey today!"}
            </p>
            {searchQuery || filter !== 'All' ? (
              <Button variant="outline" className="rounded-xl" onClick={() => { setSearchQuery(''); setFilter('All'); }}>
                Clear Filters
              </Button>
            ) : (
              <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/community')}>
                Generate Your First Course
              </Button>
            )}
          </div>
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
