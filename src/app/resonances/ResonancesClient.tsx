"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Heart, ArrowLeft, User, Check, MessageCircle, ExternalLink } from "lucide-react";
import { CARD_QUESTIONS } from "@/types";

interface Resonance {
  id: string;
  cardQuoteField: string;
  cardQuoteText: string;
  message: string;
  status: string;
  createdAt: string;
  fromUserId: string;
  conversationId: string | null;
  sender: {
    id: string;
    username: string;
    avatarUrl: string | null;
    genderIdentity: string | null;
  } | null;
}

interface Props {
  pending: Resonance[];
  accepted: Resonance[];
  username: string;
  userId: string;
}

export default function ResonancesClient({ pending, accepted, username, userId }: Props) {
  const [localPending, setLocalPending] = useState(pending);
  const [localAccepted, setLocalAccepted] = useState(accepted);
  const [acting, setActing] = useState<string | null>(null);

  async function handleAccept(resonanceId: string) {
    setActing(resonanceId);
    const supabase = createClient();
    const resonance = localPending.find((r) => r.id === resonanceId);
    if (!resonance) { setActing(null); return; }

    await supabase.from("Resonance").update({ status: "ACCEPTED" }).eq("id", resonanceId);

    // Reuse existing conversation if one already exists between these two users
    const { data: existingConv } = await supabase
      .from("Conversation")
      .select("id")
      .or(
        `and(user1Id.eq.${userId},user2Id.eq.${resonance.fromUserId}),and(user1Id.eq.${resonance.fromUserId},user2Id.eq.${userId})`
      )
      .maybeSingle();

    let conversationId = existingConv?.id ?? null;
    if (!conversationId) {
      conversationId = crypto.randomUUID();
      await supabase.from("Conversation").insert({
        id: conversationId,
        resonanceId,
        user1Id: userId,
        user2Id: resonance.fromUserId,
      });
    }

    setLocalPending((prev) => prev.filter((r) => r.id !== resonanceId));
    setLocalAccepted((prev) => [
      { ...resonance, status: "ACCEPTED", conversationId },
      ...prev,
    ]);
    setActing(null);
  }

  async function handlePass(resonanceId: string) {
    setActing(resonanceId);
    const supabase = createClient();

    await supabase
      .from("Resonance")
      .update({ status: "PASSED" })
      .eq("id", resonanceId);

    setLocalPending((prev) => prev.filter((r) => r.id !== resonanceId));
    setActing(null);
  }

  const getTagLabel = (field: string) =>
    CARD_QUESTIONS.find((q) => q.field === field)?.tag ?? field;

  return (
    <div className="min-h-screen bg-background">
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
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">You moved someone.</h1>
          <p className="text-sm text-muted-foreground">
            Someone read your card and something stayed with them.
            You decide what happens next.
          </p>
        </div>

        {/* PENDING */}
        {localPending.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Waiting for you — {localPending.length}
            </h2>
            {localPending.map((r) => (
              <ResonanceCard
                key={r.id}
                resonance={r}
                tagLabel={getTagLabel(r.cardQuoteField)}
                onAccept={() => handleAccept(r.id)}
                onPass={() => handlePass(r.id)}
                isActing={acting === r.id}
              />
            ))}
          </section>
        )}

        {/* EMPTY STATE */}
        {localPending.length === 0 && localAccepted.length === 0 && (
          <div className="card-soft p-8 text-center">
            <div className="w-12 h-12 rounded-2xl safe-space-gradient flex items-center justify-center mx-auto mb-4">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">
              Nothing here yet, {username}.
            </p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              When someone reads your card and something resonates,
              you&apos;ll see it here.
            </p>
          </div>
        )}

        {/* ACCEPTED / CONNECTIONS */}
        {localAccepted.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              People you&apos;ve let in — {localAccepted.length}
            </h2>

            {localAccepted.map((r) => (
              <div key={r.id} className="card-soft p-4 flex items-center gap-3">
                <Link
                  href={`/profile/${r.sender?.username}`}
                  className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0 hover:border-primary/40 transition-colors"
                >
                  {r.sender?.avatarUrl ? (
                    <img src={r.sender.avatarUrl} alt={r.sender.username} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{r.sender?.username}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Check className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">Connected</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/profile/${r.sender?.username}`}
                    className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    title="View profile"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  {r.conversationId && (
                    <Link
                      href={`/messages/${r.conversationId}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90 transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Message
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function ResonanceCard({
  resonance,
  tagLabel,
  onAccept,
  onPass,
  isActing,
}: {
  resonance: Resonance;
  tagLabel: string;
  onAccept: () => void;
  onPass: () => void;
  isActing: boolean;
}) {
  return (
    <div className="card-soft p-6 space-y-4">
      <Link
        href={`/profile/${resonance.sender?.username}`}
        className="flex items-center gap-3 group/sender w-fit"
      >
        <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
          {resonance.sender?.avatarUrl ? (
            <img src={resonance.sender.avatarUrl} className="w-9 h-9 rounded-xl object-cover" alt="" />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground group-hover/sender:text-primary transition-colors flex items-center gap-1">
            {resonance.sender?.username}
            <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover/sender:opacity-100 transition-opacity" />
          </div>
          <div className="text-xs text-muted-foreground capitalize">{resonance.sender?.genderIdentity}</div>
        </div>
      </Link>

      <div className="bg-lavender-50 border border-lavender-100 rounded-xl p-4">
        <span className="text-xs font-semibold text-primary block mb-1">{tagLabel}</span>
        <p className="text-sm text-foreground leading-relaxed italic">
          &ldquo;{resonance.cardQuoteText}&rdquo;
        </p>
      </div>

      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          What stayed with them
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          {resonance.message}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={onAccept}
          disabled={isActing}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-primary"
        >
          {isActing ? "..." : "Let them in"}
        </button>
        <button
          onClick={onPass}
          disabled={isActing}
          className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          Pass
        </button>
      </div>
    </div>
  );
}
