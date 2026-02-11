import { motion } from "framer-motion";
import { Code2, Brain, Mic, BarChart3, Users, Trophy, Target, BookOpen } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Coding Practice",
    description: "2500+ problems with multi-language editor, company tags, and real-time test execution.",
    gradient: "gradient-primary",
  },
  {
    icon: BookOpen,
    title: "Aptitude & MCQ Tests",
    description: "Timed assessments with adaptive difficulty, instant feedback, and detailed explanations.",
    gradient: "gradient-accent",
  },
  {
    icon: Mic,
    title: "AI Speech Coach",
    description: "Practice interviews with AI-powered fluency analysis, filler word detection, and confidence scoring.",
    gradient: "gradient-amber",
  },
  {
    icon: Brain,
    title: "Smart Recommendations",
    description: "Hybrid ML algorithm personalizes your learning path based on skills, goals, and timeline.",
    gradient: "gradient-primary",
  },
  {
    icon: Target,
    title: "Campus Intelligence",
    description: "Company-specific prep using historical placement data and peer insights from your campus.",
    gradient: "gradient-accent",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track progress with heatmaps, weak-area analysis, and placement readiness scoring.",
    gradient: "gradient-amber",
  },
  {
    icon: Users,
    title: "Peer Learning",
    description: "Discussion forums, solution sharing, mock interview pairing with campus peers.",
    gradient: "gradient-primary",
  },
  {
    icon: Trophy,
    title: "Gamification",
    description: "Daily streaks, achievement badges, leaderboards, and XP to keep you motivated.",
    gradient: "gradient-accent",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Brain className="h-4 w-4" />
            Powerful Features
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Everything You Need,{" "}
            <span className="text-gradient">One Platform</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Stop switching between 7 platforms. IntelliPrep integrates every skill you need 
            for placement success with AI-powered personalization.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.gradient}`}>
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
