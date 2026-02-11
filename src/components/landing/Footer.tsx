import { Code2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <Code2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Intelli<span className="text-gradient">Prep</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 IntelliPrep. AI-Driven Placement Preparation Ecosystem.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
