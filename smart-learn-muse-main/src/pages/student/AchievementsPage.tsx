import GamificationPanel from "@/components/features/GamificationPanel";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export default function AchievementsPage() {
    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-warning" />
                    Achievements & Leaderboard
                </h1>
                <p className="text-muted-foreground text-sm mt-1">See how you rank against others</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="col-span-full lg:col-span-2">
                    <GamificationPanel />
                </div>
            </div>
        </div>
    );
}
