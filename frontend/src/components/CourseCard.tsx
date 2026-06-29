import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Award, BookOpen, Layers3, Trash2 } from 'lucide-react';
import { courseProgress } from '../utils/courseProgress';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function CourseCard({ course, onDelete, index = 0 }: { course: any, onDelete: (id: string) => void, index?: number }) {
  const navigate = useNavigate();

  if (!course) return null;
  const modules = course?.modules?.length || 0;
  const progress = courseProgress(course);

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer">
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/10 blur-3xl transition duration-200 group-hover:bg-primary/20" />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6" />
            </span>
            <h3 className="font-semibold text-xl leading-tight text-foreground transition-colors group-hover:text-primary">
              {course.title}
            </h3>
            {course.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {course.description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(course._id);
            }}
            className="opacity-50 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
            title="Delete course"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-4 text-xs font-medium text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers3 className="h-3.5 w-3.5 text-primary" />
            {modules} Modules
          </span>
          <span>{progress.totalLessons} Lessons</span>
          <span className="ml-auto text-foreground">{progress.percentage}%</span>
        </div>
        
        <Progress value={progress.percentage} className="h-2 mt-3" />
        
        {progress.percentage === 100 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-500">
            <Award className="h-3.5 w-3.5" />
            Certificate Unlocked
          </p>
        )}
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          variant="secondary"
          className="w-full justify-between"
          onClick={() => navigate(`/course/${course._id}`)}
        >
          Open Learning Path
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
