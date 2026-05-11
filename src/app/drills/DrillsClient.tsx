"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Heart, ArrowLeft, ArrowRight, CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface Drill {
  id: string;
  scenario: string;
  context: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  bestOption: string;
  explanation: string;
  category: string;
  attempt: { chosen: string; correct: boolean } | null;
}

interface Props {
  drills: Drill[];
  userId: string;
}

const OPTIONS = ["A", "B", "C", "D"] as const;

const CATEGORY_LABELS: Record<string, string> = {
  TEXTING: "Texting", FIRST_DATES: "First dates", CONFLICT: "Conflict",
  COMMUNICATION: "Communication", BOUNDARIES: "Boundaries",
  LOVE_LANGUAGES: "Love languages", RED_FLAGS: "Red flags",
  UNDERSTANDING: "Understanding", GENERAL: "General",
};

export default function DrillsClient({ drills, userId }: Props) {
  const [index, setIndex] = useState(() => {
    // Start at first unattempted drill
    const first = drills.findIndex((d) => !d.attempt);
    return first === -1 ? 0 : first;
  });
  const [chosen, setChosen] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [localAttempts, setLocalAttempts] = useState<Record<string, { chosen: string; correct: boolean }>>(() =>
    Object.fromEntries(drills.filter((d) => d.attempt).map((d) => [d.id, d.attempt!]))
  );

  const drill = drills[index];
  if (!drill) return null;

  const attempt = localAttempts[drill.id] ?? null;
  const answered = !!attempt || chosen !== null;
  const activeChosen = attempt?.chosen ?? chosen;
  const correct = activeChosen === drill.bestOption;

  const correctCount = Object.values(localAttempts).filter((a) => a.correct).length;
  const totalAnswered = Object.keys(localAttempts).length;

  async function handleChoose(option: string) {
    if (attempt || saving) return;
    setChosen(option);
    setSaving(true);

    const isCorrect = option === drill.bestOption;
    const supabase = createClient();

    await supabase.from("DrillAttempt").insert({
      id: crypto.randomUUID(),
      drillId: drill.id,
      userId,
      chosen: option,
      correct: isCorrect,
    });

    setLocalAttempts((prev) => ({ ...prev, [drill.id]: { chosen: option, correct: isCorrect } }));
    setSaving(false);
  }

  function getOptionText(option: typeof OPTIONS[number]) {
    return drill[`option${option}` as keyof Drill] as string;
  }

  function getOptionStyle(option: string) {
    if (!answered) {
      return "bg-muted border-border text-foreground hover:border-primary/40 hover:bg-lavender-50 cursor-pointer";
    }
    if (option === drill.bestOption) {
      return "bg-green-50 border-green-400 text-green-800";
    }
    if (option === activeChosen && option !== drill.bestOption) {
      return "bg-blush-50 border-blush-400 text-blush-800";
    }
    return "bg-muted border-border text-muted-foreground opacity-50";
  }

  const allDone = drills.every((d) => localAttempts[d.id]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg safe-space-gradient flex items-center justify-center shadow-soft">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              decode<span className="text-primary">her</span>
            </span>
          </div>
          {totalAnswered > 0 ? (
            <span className="text-xs font-semibold text-primary bg-lavender-50 border border-lavender-100 px-2.5 py-1 rounded-full">
              {correctCount}/{totalAnswered} right
            </span>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Empathy drills.</h1>
          <p className="text-sm text-muted-foreground">
            Real scenarios. What would you actually do?
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{index + 1} of {drills.length}</span>
            <span className="text-xs font-semibold text-primary bg-lavender-50 border border-lavender-100 px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[drill.category] ?? drill.category}
            </span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${((index + 1) / drills.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Scenario card */}
        <div className="card-soft p-6 space-y-4">
          <div className="bg-lavender-50 border border-lavender-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-foreground leading-snug mb-2">
              {drill.scenario}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">{drill.context}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => handleChoose(opt)}
                disabled={answered || saving}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${getOptionStyle(opt)}`}
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  answered && opt === drill.bestOption ? "bg-green-400 text-white" :
                  answered && opt === activeChosen && opt !== drill.bestOption ? "bg-blush-400 text-white" :
                  "bg-background border border-border text-muted-foreground"
                }`}>
                  {answered && opt === drill.bestOption ? <CheckCircle className="w-3.5 h-3.5" /> :
                   answered && opt === activeChosen && opt !== drill.bestOption ? <XCircle className="w-3.5 h-3.5" /> :
                   opt}
                </span>
                <span className="text-sm leading-relaxed">{getOptionText(opt)}</span>
              </button>
            ))}
          </div>

          {/* Result + explanation */}
          {answered && (
            <div className={`rounded-xl p-4 border ${
              correct ? "bg-green-50 border-green-200" : "bg-muted border-border"
            }`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                correct ? "text-green-700" : "text-muted-foreground"
              }`}>
                {correct ? "You got it." : `Best answer was ${drill.bestOption}`}
              </p>
              <p className="text-sm text-foreground leading-relaxed">{drill.explanation}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {answered && (
          <div className="flex gap-3">
            {index > 0 && (
              <button
                onClick={() => { setIndex((i) => i - 1); setChosen(null); }}
                className="flex items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Prev
              </button>
            )}

            {allDone ? (
              <div className="flex-1 card-soft p-4 text-center">
                <p className="text-sm font-semibold text-foreground mb-0.5">
                  All done — {correctCount} of {drills.length} right.
                </p>
                <button
                  onClick={() => {
                    setLocalAttempts({});
                    setIndex(0);
                    setChosen(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline font-medium mx-auto mt-1"
                >
                  <RotateCcw className="w-3 h-3" /> Try again
                </button>
              </div>
            ) : index < drills.length - 1 ? (
              <button
                onClick={() => { setIndex((i) => i + 1); setChosen(null); }}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all glow-primary"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>
        )}

        {/* Drill navigation dots */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {drills.map((d, i) => {
            const a = localAttempts[d.id];
            return (
              <button
                key={d.id}
                onClick={() => { setIndex(i); setChosen(null); }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === index ? "bg-primary scale-125" :
                  a?.correct ? "bg-green-400" :
                  a ? "bg-blush-400" :
                  "bg-border hover:bg-muted-foreground"
                }`}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
