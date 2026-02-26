import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const quickPrompts = [
  "Recommend a course for me",
  "Help me with Python basics",
  "Explain neural networks",
  "Quiz me on ML concepts",
];

export default function AIChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi! 👋 I'm your AI learning assistant. I can help you with course recommendations, study tips, and answering your questions. What would you like to learn today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (replace with real API later)
    setTimeout(() => {
      const responses = [
        "Based on your learning patterns, I'd recommend focusing on the Machine Learning Fundamentals course next. Your Python skills are strong enough to handle it! 🚀",
        "Great question! Let me break that down for you. The key concept here is that neural networks learn by adjusting weights through backpropagation. Think of it like tuning a guitar — each adjustment gets you closer to the right note. 🎵",
        "I've analyzed your quiz performance. You're strongest in Python fundamentals (92%) and need improvement in statistics (68%). Want me to create a study plan? 📊",
        "Here's a quick tip: Try the Pomodoro technique — study for 25 minutes, then take a 5-minute break. Your concentration scores show you perform best in shorter sessions! ⏰",
      ];
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responses[Math.floor(Math.random() * responses.length)] },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary text-primary-foreground shadow-xl flex items-center justify-center glow-primary ${isOpen ? "hidden" : ""}`}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[520px] glass-card rounded-2xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-primary-foreground">AI Tutor</h3>
                  <p className="text-xs text-primary-foreground/70">Always here to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-md hover:bg-primary-foreground/10">
                <X className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-sm"
                      : "bg-secondary text-secondary-foreground rounded-bl-sm"
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary px-4 py-2 rounded-xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {quickPrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => { setInput(p); }}
                    className="px-2.5 py-1 bg-secondary hover:bg-secondary/80 rounded-full text-xs text-secondary-foreground transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 rounded-lg gradient-primary text-primary-foreground disabled:opacity-40 hover:shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
