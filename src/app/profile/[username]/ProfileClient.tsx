"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Heart, User, ArrowLeft, X, Check, MessageCircle } from "lucide-react";
import { CARD_QUESTIONS } from "@/types";

interface Profile {
  id: string;
  username: string;
  experience: string;
  genderIdentity: string | null;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

interface Card {
  [key: string]: string | boolean | string[] | null;
}

interface Props {
  profile: Profile;
  card: Card | null;
  viewer: { id: string; username: string; experience: string } | null;
  isOwnProfile: boolean;
  canResonate: boolean;
  existingResonance: { id: string; status: string } | null;
  existingConversation: { id: string } | null;
}

export default function ProfileClient({
  profile,
  card,
  isOwnProfile,
  canResonate,
  existingResonance,
  existingConversation,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  // Only show card questions that were actually answered
  const answeredQuestions = CARD_QUESTIONS.filter(
    (q) => card && card[q.field as string] && (card[q.field as string] as string).trim() !== ""
  );

  async function handleSendResonance() {
    if (!selectedField || !selectedQuote || !message.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: dbError } = await supabase.from("Resonance").insert({
      id: crypto.randomUUID(),
      fromUserId: user.id,
      toUserId: profile.id,
      cardQuoteField: selectedField,
      cardQuoteText: selectedQuote,
      message: message.trim(),
      status: "PENDING",
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
    setTimeout(() => setModalOpen(false), 1800);
  }

  const resonanceButtonState = () => {
    if (existingResonance?.status === "ACCEPTED") return "connected";
    if (existingResonance) return "sent";
    return "idle";
  };

  const btnState = resonanceButtonState();

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal nav */}
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
          {isOwnProfile && (
            <div className="flex items-center gap-3">
              <Link href="/profile/edit" className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                Edit profile
              </Link>
              <Link href="/card" className="text-sm text-primary hover:underline font-medium">
                Edit card
              </Link>
            </div>
          )}
          {!isOwnProfile && <div className="w-16" />}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── PROFILE HEADER ── */}
        <div className="card-soft p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.username} className="w-16 h-16 rounded-2xl object-cover" />
              ) : (
                <User className="w-7 h-7 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-foreground mb-0.5">{profile.username}</h1>
              {profile.genderIdentity && (
                <p className="text-sm text-muted-foreground capitalize mb-1">{profile.genderIdentity}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-foreground leading-relaxed mt-2">{profile.bio}</p>
              )}
            </div>

          </div>

          {/* Connection / resonance button */}
          {canResonate && (
            <div className="mt-5 pt-5 border-t border-border">
              {existingConversation ? (
                // Already connected — go straight to the DM
                <Link
                  href={`/messages/${existingConversation.id}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all glow-primary"
                >
                  <MessageCircle className="w-4 h-4" /> Message
                </Link>
              ) : btnState === "connected" ? (
                <div className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-muted text-sm font-semibold text-foreground">
                  <Check className="w-4 h-4 text-primary" /> Connected
                </div>
              ) : btnState === "sent" ? (
                <div className="w-full py-3 rounded-xl bg-muted text-sm font-semibold text-muted-foreground text-center">
                  Resonance sent — waiting
                </div>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all glow-primary"
                >
                  This resonated
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── DATE ME CARD ── */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {isOwnProfile ? "Your How to Date Me card" : `${profile.username}'s card`}
          </h2>

          {answeredQuestions.length === 0 ? (
            <div className="card-soft p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isOwnProfile ? "You haven't filled out your card yet." : "This person hasn't filled out their card yet."}
              </p>
              {isOwnProfile && (
                <Link href="/onboarding" className="inline-block mt-3 text-sm text-primary hover:underline font-medium">
                  Fill it out now →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {answeredQuestions.map((q) => (
                <div key={q.field as string} className="card-soft p-5">
                  <span className="inline-block text-xs font-semibold text-primary bg-lavender-50 border border-lavender-100 px-3 py-1 rounded-full mb-3">
                    {q.tag}
                  </span>
                  <p className="text-sm text-foreground leading-relaxed">
                    {card?.[q.field as string] as string}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── RESONANCE MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-background rounded-2xl w-full max-w-lg shadow-lavender max-h-[85vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <div>
                <h3 className="font-bold text-foreground">This resonated</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pick the part that stayed with you — then say why.
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-3">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl safe-space-gradient flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  <p className="font-semibold text-foreground mb-1">Resonance sent.</p>
                  <p className="text-sm text-muted-foreground">
                    She&apos;ll see it when she&apos;s ready.
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1 — pick a quote */}
                  {!selectedField ? (
                    <>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Which part resonated?
                      </p>
                      {answeredQuestions.map((q) => (
                        <button
                          key={q.field as string}
                          onClick={() => {
                            setSelectedField(q.field as string);
                            setSelectedQuote(card?.[q.field as string] as string);
                          }}
                          className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-primary/40 bg-muted hover:bg-lavender-50 transition-all"
                        >
                          <span className="text-xs font-semibold text-primary block mb-1">{q.tag}</span>
                          <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                            {card?.[q.field as string] as string}
                          </p>
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {/* Step 2 — write the sentence */}
                      <button
                        onClick={() => { setSelectedField(null); setSelectedQuote(null); setMessage(""); }}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" /> Choose a different part
                      </button>

                      {/* Selected quote preview */}
                      <div className="p-4 rounded-xl bg-lavender-50 border border-lavender-100">
                        <span className="text-xs font-semibold text-primary block mb-1">
                          {CARD_QUESTIONS.find(q => q.field === selectedField)?.tag}
                        </span>
                        <p className="text-sm text-foreground leading-relaxed italic">
                          &ldquo;{selectedQuote}&rdquo;
                        </p>
                      </div>

                      <div className="mt-1">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          What specifically stayed with you?
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="One honest sentence. That's all she needs to see."
                          rows={3}
                          maxLength={280}
                          className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none"
                        />
                        <div className="flex justify-end mt-1">
                          <span className="text-xs text-muted-foreground">{message.length}/280</span>
                        </div>
                      </div>

                      {error && <p className="text-sm text-blush-500">{error}</p>}

                      <button
                        onClick={handleSendResonance}
                        disabled={!message.trim() || loading}
                        className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
                      >
                        {loading ? "Sending..." : "Send resonance"}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
