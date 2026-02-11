import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Code2, Brain, Mic } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] items-center px-4">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary-foreground/90">AI-Powered Placement Prep</span>
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl">
              Your Complete
              <br />
              <span className="text-gradient"> Placement Prep</span>
              <br />
              Ecosystem
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-primary-foreground/70">
              Stop juggling 7 platforms. IntelliPrep combines coding practice, aptitude tests, 
              AI interview coaching, and campus-specific intelligence — all personalized for you.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary border-0 text-primary-foreground shadow-xl hover:opacity-90 group">
                  Start Preparing Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#features">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10">
                  Explore Features
                </Button>
              </a>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">2500+</div>
                <div className="text-xs text-primary-foreground/60">Problems</div>
              </div>
              <div className="h-8 w-px bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">500+</div>
                <div className="text-xs text-primary-foreground/60">MCQ Tests</div>
              </div>
              <div className="h-8 w-px bg-primary-foreground/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-foreground">30%+</div>
                <div className="text-xs text-primary-foreground/60">Score Boost</div>
              </div>
            </div>
          </motion.div>

          {/* Right floating cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative h-[500px]">
              {/* Card 1 - Code */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 top-8 w-72 rounded-2xl border border-border/30 bg-card/90 p-6 shadow-xl backdrop-blur-sm"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                    <Code2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground">Two Sum</div>
                    <div className="text-xs text-muted-foreground">Arrays • Easy</div>
                  </div>
                </div>
                <div className="rounded-lg bg-navy p-3 font-mono text-xs text-emerald">
                  <div className="text-muted-foreground">{"// Solution"}</div>
                  <div>def twoSum(nums, target):</div>
                  <div className="pl-4">seen = {"{}"}</div>
                  <div className="pl-4">for i, n in enumerate(nums):</div>
                  <div className="pl-8">if target-n in seen:</div>
                </div>
              </motion.div>

              {/* Card 2 - AI Score */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute right-0 top-0 w-64 rounded-2xl border border-border/30 bg-card/90 p-5 shadow-xl backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent">
                    <Brain className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground">AI Analysis</div>
                    <div className="text-xs text-muted-foreground">Placement Ready</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">DSA</span>
                    <span className="font-semibold text-emerald">82%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full gradient-accent" style={{ width: "82%" }} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Aptitude</span>
                    <span className="font-semibold text-primary">75%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full gradient-primary" style={{ width: "75%" }} />
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - Speech */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-16 right-12 w-60 rounded-2xl border border-border/30 bg-card/90 p-5 shadow-xl backdrop-blur-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-amber">
                    <Mic className="h-5 w-5 text-amber-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-card-foreground">Speech Score</div>
                    <div className="text-xs text-muted-foreground">Interview Prep</div>
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  {[40, 65, 50, 80, 70, 90, 85].map((h, i) => (
                    <div
                      key={i}
                      className="w-5 rounded-t gradient-amber"
                      style={{ height: `${h * 0.5}px` }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
