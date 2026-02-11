import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Code2, Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <Code2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Intelli<span className="text-gradient">Prep</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#modules" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Modules
          </a>
          <a href="#stats" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Results
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Log In
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="gradient-primary border-0 text-primary-foreground shadow-lg hover:opacity-90">
              Get Started Free
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-border bg-card px-4 py-4 md:hidden"
        >
          <div className="flex flex-col gap-3">
            <a href="#features" className="text-sm font-medium text-muted-foreground">Features</a>
            <a href="#modules" className="text-sm font-medium text-muted-foreground">Modules</a>
            <a href="#stats" className="text-sm font-medium text-muted-foreground">Results</a>
            <Link to="/auth">
              <Button className="w-full gradient-primary text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
