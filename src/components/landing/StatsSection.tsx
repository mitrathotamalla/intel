import { motion } from "framer-motion";

const stats = [
  { value: "30%+", label: "Average Score Improvement", description: "Compared to multi-platform preparation" },
  { value: "35%", label: "Time Efficiency Gain", description: "Less time switching, more time learning" },
  { value: "85%", label: "Speech Analysis Accuracy", description: "AI-powered fluency detection" },
  { value: "68%", label: "Campus Context Impact", description: "Placement success from institution-specific prep" },
];

const StatsSection = () => {
  return (
    <section id="stats" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
            Proven <span className="text-gradient">Results</span>
          </h2>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            Research-backed outcomes that demonstrate the power of integrated, personalized preparation.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mb-2 text-5xl font-black text-gradient">{stat.value}</div>
              <div className="mb-1 text-lg font-semibold text-foreground">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
