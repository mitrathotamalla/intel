import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-12 text-center md:p-20"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,hsl(234_89%_54%),transparent_70%)]" />
          <div className="relative z-10 mx-auto max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground/90">
              <Rocket className="h-4 w-4" />
              Free to Get Started
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground sm:text-5xl">
              Ready to Ace Your Placements?
            </h2>
            <p className="text-lg text-primary-foreground/70">
              Join thousands of engineering students who stopped juggling platforms 
              and started preparing smarter with IntelliPrep.
            </p>
            <Link to="/auth">
              <Button size="lg" className="mt-4 bg-card text-foreground shadow-xl hover:bg-card/90 group">
                Get Started — It's Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
