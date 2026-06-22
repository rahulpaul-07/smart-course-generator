import { ArrowRight, BookOpen, CheckCircle2, Target, Trophy, Clock, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseProgress, mostRecentLesson } from '../utils/courseProgress';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function LearningSummary({ courses }: { courses: any[] }) {
  const navigate = useNavigate();
  const recentLesson = mostRecentLesson(courses);
  const bookmarkedLessons: any[] = [];
  let totalLessons = 0;
  let completedLessons = 0;

  for (const course of courses) {
    const progress = courseProgress(course);
    totalLessons += progress.totalLessons;
    completedLessons += progress.completedLessons;

    for (const moduleDoc of course.modules || []) {
      for (const lesson of moduleDoc.lessons || []) {
        if (lesson.bookmarked) {
          bookmarkedLessons.push({
            ...lesson,
            courseId: course._id,
            courseTitle: course.title,
          });
        }
      }
    }
  }

  const completion = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = courses.filter((course) => courseProgress(course).percentage === 100).length;

  const { user } = useAuth();
  const streak = user?.studyStreak || 0;

  const stats = [
    { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Lessons Completed', value: completedLessons, icon: CheckCircle2, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Learning Streak', value: `${streak} Days`, icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Overall Progress', value: `${completion}%`, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
      <div className="md:col-span-2 lg:col-span-2">
        <Card className="h-full relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Continue Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLesson ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground line-clamp-1">{recentLesson.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {recentLesson.courseTitle} &bull; {recentLesson.moduleTitle}
                  </p>
                </div>
                <Button onClick={() => navigate(`/course/${recentLesson.courseId}/lesson/${recentLesson._id}`)}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Resume Lesson
                </Button>
              </motion.div>
            ) : (
              <div className="py-4 text-muted-foreground text-sm">
                Open any lesson to quickly resume it here.
              </div>
            )}

            {bookmarkedLessons.length > 0 && (
              <div className="mt-6 border-t border-border/50 pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Bookmarks</p>
                <div className="flex flex-wrap gap-2">
                  {bookmarkedLessons.slice(0, 3).map((lesson) => (
                    <Button
                      key={lesson._id}
                      variant="secondary"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => navigate(`/course/${lesson.courseId}/lesson/${lesson._id}`)}
                      title={lesson.courseTitle}
                    >
                      <BookOpen className="mr-2 h-3 w-3 text-primary" />
                      {lesson.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.map((stat, i) => (
        <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
          <Card className="h-full transition-colors hover:border-primary/30">
            <CardContent className="p-6 flex flex-col justify-center h-full gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
              {stat.label === 'Overall Progress' && (
                <Progress value={completion} className="h-2 mt-2" />
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
