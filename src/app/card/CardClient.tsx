"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Heart, ArrowLeft, Check, ExternalLink } from "lucide-react";
import { CARD_QUESTIONS } from "@/types";

interface Props {
  card: Record<string, string | boolean | string[] | null>;
  userId: string;
  username: string;
}

export default function CardClient({ card, userId, username }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    CARD_QUESTIONS.forEach((q) => {
      init[q.field as string] = (card[q.field as string] as string) ?? "";
    });
    return init;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError("");

    const supabase = createClient();

    const updates: Record<string, string | null> = {};
    CARD_QUESTIONS.forEach((q) => {
      updates[q.field as string] = answers[q.field as string]?.trim() || null;
    });

    const { error: dbError } = await supabase
      .from("DatingCard")
      .update({ ...updates, updatedAt: new Date().toISOString() })
      .eq("userId", userId);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }

    setSaving(false);
  }

  const answeredCount = CARD_QUESTIONS.filter(
    (q) => answers[q.field as string]?.trim()
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
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

          <Link
            href={`/profile/${username}`}
            className="flex items-center gap-1 text-sm text-primary hover:underline font-medium"
          >
            View card <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Title */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Your How to Date Me card</h1>
            <p className="text-sm text-muted-foreground">
              {answeredCount} of {CARD_QUESTIONS.length} questions answered
            </p>
          </div>
          <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${
            answeredCount === CARD_QUESTIONS.length ? "bg-green-400" : "bg-peach-400"
          }`} />
        </div>

        {/* Questions */}
        {CARD_QUESTIONS.map((q) => (
          <div key={q.field as string} className="card-soft p-6 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <span className="inline-block text-xs font-semibold text-primary bg-lavender-50 border border-lavender-100 px-3 py-1 rounded-full mb-2">
                  {q.tag}
                </span>
                <p className="text-sm font-medium text-foreground leading-snug">
                  {q.question}
                </p>
              </div>
              {answers[q.field as string]?.trim() && (
                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
              )}
            </div>

            <textarea
              value={answers[q.field as string] ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.field as string]: e.target.value }))
              }
              placeholder={q.placeholder}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none leading-relaxed"
            />
          </div>
        ))}

        {/* Error */}
        {error && (
          <p className="text-sm text-blush-500 text-center">{error}</p>
        )}

        {/* Save */}
        <div className="pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-primary"
          >
            {saving ? "Saving..." : saved ? "Saved ✓" : "Save changes"}
          </button>
        </div>

      </main>
    </div>
  );
}
