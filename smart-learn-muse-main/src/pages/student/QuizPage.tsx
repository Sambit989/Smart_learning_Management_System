import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Lightbulb, CheckCircle, XCircle, ArrowRight, RotateCcw, Zap, Trophy } from "lucide-react";
import api from "@/services/api";

const difficultyColor: any = {
  Easy: "bg-success/15 text-success border-success/30",
  Medium: "bg-warning/15 text-warning border-warning/30",
  Hard: "bg-accent/15 text-accent border-accent/30",
};

export default function QuizPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [confidence, setConfidence] = useState(50);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number[]>([]);
  const [quizId, setQuizId] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // 1. Get available quizzes
        const quizzesRes = await api.get('/quiz/available');
        if (quizzesRes.data.length > 0) {
          const firstQuiz = quizzesRes.data[0];
          setQuizId(firstQuiz.id);
          // 2. Get questions for the first quiz
          const questionsRes = await api.get(`/quiz/${firstQuiz.id}/questions`);
          setQuestions(questionsRes.data);
        }
      } catch (error) {
        console.error("Error fetching quiz", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  if (loading) return <div>Loading quiz...</div>;
  if (questions.length === 0) return <div className="p-8">No quizzes available for your enrolled courses.</div>;

  const q = questions[current];
  const isAnswered = answered.includes(current);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelected(idx);
    setAnswered([...answered, current]);
    setShowExplanation(true);
    if (idx === q.correct) setScore(score + 1);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowHint(false);
      setShowExplanation(false);
      setConfidence(50);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setShowHint(false);
    setShowExplanation(false);
    setConfidence(50);
    setScore(0);
    setAnswered([]);
  };

  const isComplete = answered.length === questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Adaptive Quiz
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered difficulty adjustment</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{score}/{questions.length}</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${i === current ? "gradient-primary" :
              answered.includes(i) ? "bg-success" :
                "bg-secondary"
              }`}
          />
        ))}
      </div>

      {!isComplete ? (
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-xl p-6 space-y-6"
        >
          {/* Question header */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Question {current + 1} of {questions.length}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColor[q.difficulty] || ""}`}>
              {q.difficulty}
            </span>
          </div>

          <h2 className="text-lg font-semibold text-foreground">{q.question}</h2>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt: string, i: number) => {
              let style = "border-border hover:border-primary/30 hover:bg-primary/5";
              if (isAnswered) {
                if (i === q.correct) style = "border-success bg-success/10";
                else if (i === selected) style = "border-destructive bg-destructive/10";
                else style = "border-border opacity-50";
              }
              return (
                <motion.button
                  key={i}
                  whileHover={!isAnswered ? { scale: 1.01 } : {}}
                  onClick={() => handleAnswer(i)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${style}`}
                >
                  <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-sm font-medium text-foreground flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-foreground">{opt}</span>
                  {isAnswered && i === q.correct && <CheckCircle className="w-5 h-5 text-success ml-auto" />}
                  {isAnswered && i === selected && i !== q.correct && <XCircle className="w-5 h-5 text-destructive ml-auto" />}
                </motion.button>
              );
            })}
          </div>

          {/* Confidence slider */}
          {!isAnswered && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence Level</span>
                <span>{confidence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}

          {/* Hint */}
          {!isAnswered && q.hint && (
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Hide hint" : "Show hint"}
            </button>
          )}
          <AnimatePresence>
            {showHint && !isAnswered && q.hint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-info/10 border border-info/20 rounded-lg p-3 text-sm text-info"
              >
                💡 {q.hint}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Explanation */}
          <AnimatePresence>
            {showExplanation && q.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-foreground"
              >
                <p className="font-medium mb-1">Explanation:</p>
                <p className="text-muted-foreground">{q.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Next */}
          {isAnswered && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={next}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all"
            >
              Next Question <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>
      ) : (
        /* Results */
        <ResultsView
          score={score}
          total={questions.length}
          restart={restart}
          quizId={quizId}
        />
      )}
    </div>
  );
}

function ResultsView({ score, total, restart, quizId }: any) {
  const [results, setResults] = useState<any>(null);
  const submitted = useRef(false);

  useEffect(() => {
    const submit = async () => {
      if (!quizId || submitted.current) return;
      submitted.current = true;
      try {
        const percentage = Math.round((score / total) * 100);
        const res = await api.post('/quiz/submit', {
          quizId,
          score: percentage
        });
        setResults(res.data);
      } catch (err) {
        console.error("Failed to submit quiz", err);
      }
    };
    submit();
  }, [quizId, score, total]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl p-8 text-center space-y-4"
    >
      <div className="text-6xl mb-4">{score >= total * 0.8 ? "🎉" : score >= total * 0.6 ? "👏" : "💪"}</div>
      <h2 className="text-2xl font-bold text-foreground">Quiz Complete!</h2>

      <div className="flex justify-center gap-8 my-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Score</p>
          <p className="text-3xl font-bold text-primary">{Math.round((score / total) * 100)}%</p>
        </div>
        {results && (
          <div className="text-center">
            <p className="text-muted-foreground text-sm">XP Earned</p>
            <div className="flex items-center gap-1 justify-center text-3xl font-bold text-warning">
              <Zap className="w-6 h-6 fill-current" /> +{results.xpEarned}
            </div>
          </div>
        )}
      </div>

      {/* Badges */}
      {results && results.newBadges?.length > 0 && (
        <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-xl mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-4 h-4 text-warning" /> New Badges Unlocked!
          </h3>
          <div className="flex justify-center gap-4">
            {results.newBadges.map((badgeId: number) => (
              <div key={badgeId} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-2xl shadow-lg animate-bounce">
                  🏅
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak */}
      {results && (
        <p className="text-sm text-muted-foreground">
          Current Streak: <span className="font-bold text-orange-500">🔥 {results.streak} Days</span>
        </p>
      )}

      <button onClick={restart} className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-medium flex items-center gap-2 mx-auto hover:shadow-lg transition-all mt-6">
        <RotateCcw className="w-4 h-4" /> Try Again
      </button>
    </motion.div>
  );
}
