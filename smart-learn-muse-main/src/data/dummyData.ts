export interface Course {
  id: number;
  title: string;
  instructor: string;
  progress: number;
  recommended: boolean;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  students: number;
  image: string;
  mlScore?: number;
  duration: string;
  skills: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: "Easy" | "Medium" | "Hard";
  hint: string;
  explanation: string;
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  earnedDate?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  streak: number;
}

export interface Notification {
  id: number;
  type: "warning" | "info" | "success" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface StudyTask {
  id: number;
  title: string;
  completed: boolean;
  time: string;
  category: string;
}

export const courses: Course[] = [
  { id: 1, title: "Python for Data Science", instructor: "Dr. Sarah Chen", progress: 72, recommended: true, category: "Data Science", difficulty: "Intermediate", rating: 4.8, students: 2340, image: "🐍", mlScore: 95, duration: "8 weeks", skills: ["Python", "Pandas", "NumPy"] },
  { id: 2, title: "Machine Learning Fundamentals", instructor: "Prof. James Wilson", progress: 45, recommended: true, category: "AI/ML", difficulty: "Advanced", rating: 4.9, students: 1820, image: "🤖", mlScore: 88, duration: "12 weeks", skills: ["ML", "TensorFlow", "Statistics"] },
  { id: 3, title: "Web Development with React", instructor: "Emily Rodriguez", progress: 90, recommended: false, category: "Web Dev", difficulty: "Beginner", rating: 4.7, students: 3100, image: "⚛️", duration: "6 weeks", skills: ["React", "JavaScript", "CSS"] },
  { id: 4, title: "Deep Learning & Neural Networks", instructor: "Dr. Alex Kim", progress: 15, recommended: true, category: "AI/ML", difficulty: "Advanced", rating: 4.6, students: 980, image: "🧠", mlScore: 82, duration: "10 weeks", skills: ["Deep Learning", "PyTorch", "CNN"] },
  { id: 5, title: "Statistics for Analytics", instructor: "Prof. Maria Lopez", progress: 0, recommended: true, category: "Data Science", difficulty: "Beginner", rating: 4.5, students: 1560, image: "📊", mlScore: 78, duration: "4 weeks", skills: ["Statistics", "R", "Probability"] },
  { id: 6, title: "Cloud Computing with AWS", instructor: "Tom Harris", progress: 30, recommended: false, category: "Cloud", difficulty: "Intermediate", rating: 4.4, students: 1200, image: "☁️", duration: "8 weeks", skills: ["AWS", "Docker", "DevOps"] },
];

export const quizQuestions: QuizQuestion[] = [
  { id: 1, question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1, difficulty: "Easy", hint: "Think about how the search space is divided.", explanation: "Binary search divides the search space in half each time, resulting in O(log n)." },
  { id: 2, question: "Which algorithm is used for finding shortest paths in weighted graphs?", options: ["BFS", "DFS", "Dijkstra's", "Prim's"], correct: 2, difficulty: "Medium", hint: "It's a greedy algorithm named after a Dutch computer scientist.", explanation: "Dijkstra's algorithm finds shortest paths from source to all vertices in weighted graphs." },
  { id: 3, question: "What is the derivative of e^x?", options: ["x·e^(x-1)", "e^x", "ln(x)", "x·e^x"], correct: 1, difficulty: "Easy", hint: "This function is special because...", explanation: "e^x is its own derivative, making it unique among functions." },
  { id: 4, question: "In neural networks, what does backpropagation compute?", options: ["Forward pass", "Gradients", "Weights", "Biases"], correct: 1, difficulty: "Hard", hint: "It uses the chain rule of calculus.", explanation: "Backpropagation computes gradients of the loss function with respect to weights using chain rule." },
  { id: 5, question: "What is overfitting in machine learning?", options: ["Model is too simple", "Model memorizes training data", "Model has high bias", "Model is underperforming"], correct: 1, difficulty: "Medium", hint: "The model works great on training data but...", explanation: "Overfitting occurs when a model learns noise in training data, performing poorly on unseen data." },
];

export const badges: Badge[] = [
  { id: 1, name: "First Steps", icon: "🎯", description: "Complete your first course", earned: true, earnedDate: "2025-01-15" },
  { id: 2, name: "Quiz Master", icon: "🏆", description: "Score 90%+ on 5 quizzes", earned: true, earnedDate: "2025-02-01" },
  { id: 3, name: "Streak Hunter", icon: "🔥", description: "7-day learning streak", earned: true, earnedDate: "2025-02-10" },
  { id: 4, name: "Data Wizard", icon: "🧙", description: "Complete all Data Science courses", earned: false },
  { id: 5, name: "AI Pioneer", icon: "🚀", description: "Complete ML Fundamentals", earned: false },
  { id: 6, name: "Night Owl", icon: "🦉", description: "Study past midnight 3 times", earned: true, earnedDate: "2025-01-28" },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "Alice Johnson", xp: 4850, avatar: "👩‍💻", streak: 21 },
  { rank: 2, name: "Bob Smith", xp: 4200, avatar: "👨‍🎓", streak: 15 },
  { rank: 3, name: "You", xp: 3900, avatar: "🎓", streak: 12 },
  { rank: 4, name: "Diana Prince", xp: 3650, avatar: "👩‍🔬", streak: 9 },
  { rank: 5, name: "Eve Williams", xp: 3400, avatar: "👩‍🏫", streak: 7 },
];

export const notifications: Notification[] = [
  { id: 1, type: "warning", title: "Low Performance Alert", message: "Your quiz scores in ML dropped below 60%. Consider reviewing Chapter 3.", time: "2 hours ago", read: false },
  { id: 2, type: "success", title: "Badge Earned!", message: "You earned the 'Streak Hunter' badge for 7 consecutive days!", time: "1 day ago", read: false },
  { id: 3, type: "info", title: "New Course Recommended", message: "Based on your interests, we recommend 'Statistics for Analytics'", time: "2 days ago", read: true },
  { id: 4, type: "alert", title: "Quiz Deadline", message: "ML Fundamentals Quiz 3 is due in 2 days", time: "3 days ago", read: true },
];

export const studyTasks: StudyTask[] = [
  { id: 1, title: "Review Python Chapter 5", completed: true, time: "9:00 AM", category: "Reading" },
  { id: 2, title: "Complete ML Quiz 3", completed: false, time: "11:00 AM", category: "Quiz" },
  { id: 3, title: "Watch Neural Networks Lecture", completed: false, time: "2:00 PM", category: "Video" },
  { id: 4, title: "Practice coding exercises", completed: false, time: "4:00 PM", category: "Practice" },
  { id: 5, title: "Review Statistics notes", completed: true, time: "6:00 PM", category: "Reading" },
];

export const performanceData = [
  { week: "W1", quizScore: 65, studyHours: 8, completion: 20 },
  { week: "W2", quizScore: 70, studyHours: 12, completion: 35 },
  { week: "W3", quizScore: 78, studyHours: 10, completion: 48 },
  { week: "W4", quizScore: 85, studyHours: 15, completion: 60 },
  { week: "W5", quizScore: 72, studyHours: 9, completion: 68 },
  { week: "W6", quizScore: 88, studyHours: 14, completion: 78 },
  { week: "W7", quizScore: 92, studyHours: 16, completion: 85 },
  { week: "W8", quizScore: 90, studyHours: 13, completion: 92 },
];

export const instructorStudents = [
  { id: 1, name: "Alice Johnson", course: "Python for DS", progress: 85, quizAvg: 88, risk: "low", lastActive: "2 hours ago" },
  { id: 2, name: "Bob Smith", course: "Python for DS", progress: 45, quizAvg: 52, risk: "high", lastActive: "3 days ago" },
  { id: 3, name: "Carol White", course: "ML Fundamentals", progress: 72, quizAvg: 75, risk: "medium", lastActive: "1 day ago" },
  { id: 4, name: "David Brown", course: "ML Fundamentals", progress: 90, quizAvg: 94, risk: "low", lastActive: "5 hours ago" },
  { id: 5, name: "Eve Williams", course: "Python for DS", progress: 30, quizAvg: 40, risk: "high", lastActive: "5 days ago" },
];

export const adminStats = {
  totalUsers: 5240,
  activeCourses: 48,
  completionRate: 72,
  avgSatisfaction: 4.6,
  monthlyGrowth: 15,
  dropoutRate: 8,
};
