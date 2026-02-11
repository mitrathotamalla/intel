import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Play, RotateCcw, ChevronRight, TrendingUp, MessageCircle, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const interviewQuestions = [
  { id: 1, text: "Tell me about yourself.", category: "HR", difficulty: "Easy" },
  { id: 2, text: "Why should we hire you?", category: "HR", difficulty: "Easy" },
  { id: 3, text: "Explain polymorphism in OOP.", category: "Technical", difficulty: "Medium" },
  { id: 4, text: "What is your greatest weakness?", category: "HR", difficulty: "Medium" },
  { id: 5, text: "Describe a challenging project you worked on.", category: "Behavioral", difficulty: "Medium" },
  { id: 6, text: "Explain the difference between TCP and UDP.", category: "Technical", difficulty: "Hard" },
];

interface SpeechSession {
  question: string;
  fluency_score: number;
  grammar_score: number;
  confidence_score: number;
  wpm: number;
  filler_count: number;
  ai_feedback: string;
  created_at: string;
}

const SpeechPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(interviewQuestions[0]);
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [pastSessions, setPastSessions] = useState<SpeechSession[]>([]);
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef("");

  useEffect(() => {
    if (user) {
      supabase
        .from("speech_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
        .then(({ data }) => {
          if (data) setPastSessions(data as SpeechSession[]);
        });
    }
  }, [user]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Not supported", description: "Speech recognition is not supported in your browser. Try Chrome.", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    fullTranscriptRef.current = "";
    setTranscript("");
    setAnalysis(null);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      fullTranscriptRef.current = final;
      setTranscript(final + interim);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    const finalTranscript = fullTranscriptRef.current || transcript;
    if (!finalTranscript.trim()) {
      toast({ title: "No speech detected", description: "Please speak into your microphone.", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-speech", {
        body: { transcript: finalTranscript, question: selectedQuestion.text },
      });

      if (error) throw error;
      setAnalysis(data);

      // Save session
      if (user) {
        await supabase.from("speech_sessions").insert({
          user_id: user.id,
          question: selectedQuestion.text,
          transcript: finalTranscript,
          fluency_score: data.fluency_score || 0,
          grammar_score: data.grammar_score || 0,
          confidence_score: data.confidence_score || 0,
          wpm: data.wpm || 0,
          filler_count: data.filler_count || 0,
          ai_feedback: data.feedback || "",
        } as any);

        // Refresh past sessions
        const { data: sessions } = await supabase
          .from("speech_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (sessions) setPastSessions(sessions as SpeechSession[]);
      }
    } catch (err: any) {
      toast({ title: "Analysis failed", description: err.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setTranscript("");
    setAnalysis(null);
    fullTranscriptRef.current = "";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-foreground">Speech Practice</h1>
          <p className="text-muted-foreground">AI-powered interview coaching with real-time feedback</p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recording Area */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {selectedQuestion.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      selectedQuestion.difficulty === "Easy"
                        ? "bg-accent/10 text-accent"
                        : selectedQuestion.difficulty === "Medium"
                        ? "bg-amber/10 text-amber"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {selectedQuestion.difficulty}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  "{selectedQuestion.text}"
                </h2>
              </div>

              <div className="flex flex-col items-center gap-6 py-8">
                <motion.button
                  onClick={() => (isRecording ? stopRecording() : startRecording())}
                  whileTap={{ scale: 0.95 }}
                  disabled={analyzing}
                  className={`flex h-24 w-24 items-center justify-center rounded-full transition-all ${
                    isRecording
                      ? "bg-destructive animate-pulse shadow-lg"
                      : "gradient-primary shadow-glow"
                  }`}
                >
                  {analyzing ? (
                    <Loader2 className="h-10 w-10 text-primary-foreground animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-10 w-10 text-destructive-foreground" />
                  ) : (
                    <Mic className="h-10 w-10 text-primary-foreground" />
                  )}
                </motion.button>
                <p className="text-sm text-muted-foreground">
                  {analyzing
                    ? "Analyzing your response with AI..."
                    : isRecording
                    ? "Recording... Click to stop & analyze"
                    : "Click to start recording your answer"}
                </p>
                {isRecording && (
                  <div className="flex items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, Math.random() * 32 + 4, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                        className="w-1 rounded-full gradient-primary"
                      />
                    ))}
                  </div>
                )}
              </div>

              {transcript && (
                <div className="rounded-xl bg-muted/50 p-4 mb-4">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2">TRANSCRIPT</h4>
                  <p className="text-sm text-foreground">{transcript}</p>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleReset}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </motion.div>

            {/* AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="mb-4 text-lg font-semibold text-foreground">AI Analysis</h3>
              {analysis ? (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      { label: "Fluency Score", value: analysis.fluency_score, suffix: "%" },
                      { label: "Words/Min", value: analysis.wpm, suffix: "", max: 200 },
                      { label: "Grammar", value: analysis.grammar_score, suffix: "%" },
                      { label: "Confidence", value: analysis.confidence_score, suffix: "%" },
                    ].map((metric) => (
                      <div key={metric.label} className="text-center">
                        <div className="text-2xl font-bold text-foreground">{metric.value}{metric.suffix}</div>
                        <div className="mb-2 text-xs text-muted-foreground">{metric.label}</div>
                        <Progress
                          value={metric.max ? (metric.value / metric.max) * 100 : metric.value}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Filler words:</span>
                    <span className="font-semibold text-foreground">{analysis.filler_count}</span>
                  </div>
                  {analysis.feedback && (
                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
                      <h4 className="text-sm font-semibold text-primary mb-1">AI Feedback</h4>
                      <p className="text-sm text-foreground">{analysis.feedback}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Fluency Score", value: "—" },
                    { label: "Words/Min", value: "—" },
                    { label: "Grammar", value: "—" },
                    { label: "Confidence", value: "—" },
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">{metric.value}</div>
                      <div className="mb-2 text-xs text-muted-foreground">{metric.label}</div>
                      <Progress value={0} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Question Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <MessageCircle className="h-4 w-4 text-primary" />
                Interview Questions
              </h3>
              <div className="space-y-2">
                {interviewQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuestion(q);
                      handleReset();
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition-all ${
                      selectedQuestion.id === q.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="line-clamp-1">{q.text}</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Past Sessions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <TrendingUp className="h-4 w-4 text-accent" />
                Past Sessions
              </h3>
              <div className="space-y-3">
                {pastSessions.length > 0 ? (
                  pastSessions.map((session, i) => (
                    <div key={i} className="rounded-xl bg-muted/50 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground line-clamp-1">{session.question}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>Fluency: <span className="font-medium text-foreground">{session.fluency_score}%</span></span>
                        <span>WPM: <span className="font-medium text-foreground">{session.wpm}</span></span>
                        <span>Fillers: <span className="font-medium text-foreground">{session.filler_count}</span></span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No sessions yet. Start practicing!</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SpeechPage;
