import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Play, CheckCircle2, Code2, Building2 } from "lucide-react";

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  topic: string;
  company_tags: string[];
  description: string;
  test_cases?: any[];
  solution?: any;
}

interface CodingProblemDetailProps {
  open: boolean;
  onClose: () => void;
  problem: Problem;
  userId: string;
  onSolved: () => void;
}

const CodingProblemDetail = ({ open, onClose, problem, userId, onSolved }: CodingProblemDetailProps) => {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ status: string; score: number } | null>(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast({ title: "Please write some code", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setResult(null);

    // Simple scoring: check if code is non-trivial (>50 chars) and contains keywords
    const hasFunction = /function|const|let|var|def|class|public|=>/.test(code);
    const hasReturn = /return|print|console|System\.out/.test(code);
    const isLongEnough = code.trim().length > 50;
    const score = (hasFunction ? 40 : 0) + (hasReturn ? 30 : 0) + (isLongEnough ? 30 : 0);
    const status = score >= 70 ? "accepted" : "attempted";

    const { error } = await supabase.from("coding_submissions").insert({
      user_id: userId,
      problem_id: problem.id,
      code,
      language,
      status,
      score,
    } as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setResult({ status, score });
      if (status === "accepted") {
        toast({ title: "Solution Accepted! 🎉", description: `Score: ${score}/100` });
        onSolved();
      } else {
        toast({ title: "Attempted", description: `Score: ${score}/100. Try improving your solution.`, variant: "destructive" });
      }
    }
    setSubmitting(false);
  };

  const testCases = Array.isArray(problem.test_cases) ? problem.test_cases : [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Problem description */}
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                problem.difficulty === "easy" ? "bg-accent/10 text-accent"
                : problem.difficulty === "medium" ? "bg-amber/10 text-amber"
                : "bg-destructive/10 text-destructive"
              }`}>
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </span>
              {problem.topic && <Badge variant="secondary">{problem.topic}</Badge>}
            </div>

            <h2 className="text-xl font-bold text-foreground">{problem.title}</h2>

            <div className="prose prose-sm text-muted-foreground whitespace-pre-wrap">
              {problem.description || "No description available."}
            </div>

            {problem.company_tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {problem.company_tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}

            {testCases.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Test Cases</h4>
                {testCases.map((tc: any, i: number) => (
                  <div key={i} className="rounded-lg bg-muted p-3 font-mono text-xs">
                    <div><span className="text-muted-foreground">Input: </span>{tc.input}</div>
                    <div><span className="text-muted-foreground">Output: </span>{tc.output}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Code editor */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Code2 className="h-4 w-4 text-primary" /> Solution
              </h3>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-36 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              className="min-h-[300px] font-mono text-sm bg-muted/50 resize-none"
              spellCheck={false}
            />

            {result && (
              <div className={`rounded-xl p-4 ${result.status === "accepted" ? "bg-accent/10 border border-accent/30" : "bg-destructive/10 border border-destructive/30"}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`h-5 w-5 ${result.status === "accepted" ? "text-accent" : "text-destructive"}`} />
                  <span className={`font-semibold ${result.status === "accepted" ? "text-accent" : "text-destructive"}`}>
                    {result.status === "accepted" ? "Accepted" : "Try Again"}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">Score: {result.score}/100</span>
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full gradient-primary border-0 text-primary-foreground gap-2"
            >
              <Play className="h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Solution"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CodingProblemDetail;
