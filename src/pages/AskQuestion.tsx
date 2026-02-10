import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Mic, Send, Loader2, Sparkles, Volume2 } from "lucide-react";

const suggestedQuestions = [
  "When should I plant wheat in Maharashtra?",
  "How to treat yellow leaves on cotton?",
  "Best fertilizer for paddy?",
  "What is the ideal soil pH for tomatoes?",
];

const AskQuestion = () => {
  const [question, setQuestion] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setAnswer(
      "Based on your question about wheat planting in Maharashtra, the ideal time is from late October to mid-November. This timing ensures the crop benefits from the cool winter months and avoids the monsoon season. Make sure your soil is well-prepared with adequate moisture before sowing. For best results, use certified seeds and apply a basal dose of nitrogen, phosphorus, and potassium fertilizers at the time of sowing."
    );
    setIsLoading(false);
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input simulation
    if (!isListening) {
      setTimeout(() => {
        setQuestion("When is the best time to plant wheat?");
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <PageLayout>
      <div className="container-app py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            AI Farming Assistant
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
            Ask Any Farming Question
          </h1>
          <p className="text-lg text-muted-foreground">
            Type or speak your question in Hindi, English, or your local language.
            Get instant AI-powered answers.
          </p>
        </div>

        {/* Question Input */}
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="relative">
                <Textarea
                  placeholder="Type your farming question here..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[120px] pr-12 resize-none"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute right-2 top-2 ${
                    isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : ""
                  }`}
                  onClick={handleVoiceInput}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {isListening && (
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 bg-destructive rounded-full animate-pulse" />
                      Listening...
                    </span>
                  )}
                </div>
                <Button onClick={handleSubmit} disabled={!question.trim() || isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                  {isLoading ? "Thinking..." : "Get Answer"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggested Questions */}
          {!answer && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Popular questions:
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuestion(q)}
                    className="px-4 py-2 rounded-full bg-muted text-sm text-foreground hover:bg-muted/80 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Answer Display */}
          {answer && (
            <Card className="animate-fade-in bg-primary/5 border-primary/20">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span className="font-heading font-bold text-foreground">
                      KisanMitra AI
                    </span>
                  </div>
                  <Button variant="ghost" size="icon-sm">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-foreground leading-relaxed">{answer}</p>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    Was this helpful?
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      👍 Yes
                    </Button>
                    <Button variant="outline" size="sm">
                      👎 No
                    </Button>
                    <Button variant="secondary" size="sm" className="ml-auto">
                      Ask Follow-up
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default AskQuestion;
