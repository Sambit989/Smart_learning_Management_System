import StudyPlanner from "@/components/features/StudyPlanner";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";

export default function StudyPlannerPage() {
    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Study Planner
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your learning schedule</p>
            </motion.div>

            <div className="w-full">
                <StudyPlanner isFullPage={true} />
            </div>
        </div>
    );
}
