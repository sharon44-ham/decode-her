"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { CARD_QUESTIONS } from "@/types";
import { Heart, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

interface Props {
  userId: string;
  username: string;
  experience: string;
}

// step 0 = welcome, steps 1–8 = questions, step 9 = done
export default function OnboardingClient({ userId, username, experience }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalQuestions = CARD_QUESTIONS.length; // 8
  const currentQuestion = step >= 1 && step <= totalQuestions ? CARD_QUESTIONS[step - 1] : null;
  const isLastQuestion = step === totalQuestions;
  const progressPercent = step === 0 ? 0 : Math.round((step / totalQuestions) * 100);

  function handleAnswer(value: string) {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.field as string]: value }));
  }

  function handleNext() {
    if (step < totalQuestions) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  async function handleFinish() {
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error: dbError } = await supabase.from("DatingCard").insert({
      id: crypto.randomUUID(),
      userId,
      shareToken: crypto.randomUUID(),
      isPublic: false,
      onSupport: answers.onSupport || null,
      onBeingUnderstood: answers.onBeingUnderstood || null,
      onDepth: answers.onDepth || null,
      onConflict: answers.onConflict || null,
      onPatterns: answers.onPatterns || null,
      onSafety: answers.onSafety || null,
      onLoveLanguage: answers.onLoveLanguage || null,
      onFalling: answers.onFalling || null,
      dealbreakers: [],
      greenFlags: [],
      updatedAt: new Date().toISOString(),
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setStep(9); // completion screen
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  // ── COMPLETION SCREEN ──
  if (step === 9) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 rounded-2xl safe-space-gradient flex items-center justify-center mx-auto mb-6 shadow-lavender">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Your card is ready.</h1>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          That took courage. Taking you to your dashboard now.
        </p>
        <div className="mt-6 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── WELCOME SCREEN ──
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Logo />
        <div className="w-full max-w-md card-soft p-8 text-center">
          <div className="w-12 h-12 rounded-2xl safe-space-gradient flex items-center justify-center mx-auto mb-5 shadow-soft">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Hey {username} {experience === "SAFE_SPACE" ? "💜" : "👋"}
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Before you dive in, we have{" "}
            <span className="font-semibold text-foreground">8 questions</span> for you.
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            This is your <span className="font-semibold text-foreground">How to Date Me</span> card —
            the most honest dating profile you&apos;ll ever write. Not what you like.{" "}
            <span className="text-foreground font-medium">How you actually work.</span>
          </p>

          <div className="bg-muted rounded-xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">~5 minutes.</span> Take your time.
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Skip anything</span> that&apos;s not ready yet.
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">No right answers.</span> Just honest ones.
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all glow-primary"
          >
            Let&apos;s begin <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ── QUESTION SCREENS (steps 1–8) ──
  if (!currentQuestion) return null;

  const currentAnswer = answers[currentQuestion.field as string] ?? "";

  return (
    <div className="min-h-screen bg-background flex flex-col p-4">
      {/* Top bar */}
      <div className="max-w-lg mx-auto w-full pt-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <Logo small />
          <span className="text-xs text-muted-foreground font-medium">
            {step} of {totalQuestions}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col">
        <div className="card-soft p-8 flex-1 flex flex-col">
          {/* Tag */}
          <span className="inline-block text-xs font-semibold text-primary bg-lavender-50 border border-lavender-100 px-3 py-1 rounded-full mb-5 self-start">
            {currentQuestion.tag}
          </span>

          {/* Question */}
          <h2 className="text-lg font-semibold text-foreground leading-snug mb-6">
            {currentQuestion.question}
          </h2>

          {/* Answer textarea */}
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            rows={5}
            className="w-full flex-1 px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none leading-relaxed"
          />

          {error && <p className="text-sm text-blush-500 mt-3">{error}</p>}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              onClick={() => { handleAnswer(""); handleNext(); }}
              className="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 glow-primary"
              >
                {loading ? "Saving..." : <>Finish & see my card <ArrowRight className="w-4 h-4" /></>}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all glow-primary"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${small ? "" : "mb-8"}`}>
      <div
        className={`rounded-xl safe-space-gradient flex items-center justify-center shadow-soft ${
          small ? "w-6 h-6" : "w-8 h-8"
        }`}
      >
        <Heart className={`text-white fill-white ${small ? "w-3 h-3" : "w-4 h-4"}`} />
      </div>
      {!small && (
        <span className="font-bold text-lg tracking-tight text-foreground">
          decode<span className="text-primary">her</span>
        </span>
      )}
    </div>
  );
}
