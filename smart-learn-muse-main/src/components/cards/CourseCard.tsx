import { Course } from "@/data/dummyData";
import { motion } from "framer-motion";
import { Star, Users, Clock, Sparkles } from "lucide-react";

interface CourseCardProps {
  course: Course;
  index?: number;
  onEnroll?: (courseId: number) => void;
  onView?: (courseId: number) => void;
  isEnrolled?: boolean;
}

export default function CourseCard({ course, index = 0, onEnroll, onView, isEnrolled = false }: CourseCardProps) {
  const difficultyColor = {
    Beginner: "bg-success/15 text-success",
    Intermediate: "bg-warning/15 text-warning",
    Advanced: "bg-accent/15 text-accent",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card-hover rounded-xl overflow-hidden group"
    >
      {/* Header */}
      <div className="relative h-32 gradient-primary flex items-center justify-center overflow-hidden">
        {course.image.startsWith('http') ? (
          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{course.image}</span>
        )}
        {course.recommended && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            AI Pick
          </div>
        )}
        {course.mlScore && (
          <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-foreground">
            {course.mlScore}% Match
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyColor[course.difficulty]}`}>
            {course.difficulty}
          </span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="w-3 h-3 text-warning fill-warning" />
            {course.rating}
          </div>
        </div>

        <h3 className="font-semibold text-foreground leading-tight">{course.title}</h3>
        <p className="text-xs text-muted-foreground">{course.instructor}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {course.skills.slice(0, 3).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-secondary rounded-full text-xs text-secondary-foreground">
              {s}
            </span>
          ))}
        </div>

        {/* Progress */}
        {course.progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{course.progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full gradient-primary rounded-full"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {course.students.toLocaleString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isEnrolled && onView) {
              onView(course.id);
            } else if (onEnroll) {
              onEnroll(course.id);
            }
          }}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${isEnrolled || course.progress > 0
            ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            : "gradient-primary text-primary-foreground hover:shadow-lg"
            }`}>
          {isEnrolled ? (course.progress > 0 ? "Continue Learning" : "Start Learning") : "Enroll Now"}
        </button>
      </div>
    </motion.div>
  );
}
