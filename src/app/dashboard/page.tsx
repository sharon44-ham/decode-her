import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, CreditCard,
  ArrowRight, PenLine, Sparkles, Heart, User, ChevronRight
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [profileRes, cardRes] = await Promise.all([
    supabase.from("User").select("username, experience").eq("id", user.id).single(),
    supabase.from("DatingCard").select("id, onSupport, onSafety, onFalling, isPublic").eq("userId", user.id).single(),
  ]);

  const profile = profileRes.data;
  const card = cardRes.data;
  const isSafeSpace = profile?.experience === "SAFE_SPACE";

  // Fetch all other users who have filled out cards (for mutual discovery)
  let discoverCards: Array<{
    id: string; username: string; avatarUrl: string | null;
    genderIdentity: string | null; cardPreview: string | null;
  }> = [];

  // Get IDs of users already connected with (existing conversation = already let in)
  const { data: connectedConvs } = await supabase
    .from("Conversation")
    .select("user1Id, user2Id")
    .or(`user1Id.eq.${user.id},user2Id.eq.${user.id}`);

  const connectedIds = (connectedConvs ?? []).map((c) =>
    c.user1Id === user.id ? c.user2Id : c.user1Id
  );

  let othersQuery = supabase
    .from("User")
    .select("id, username, avatarUrl, genderIdentity")
    .neq("id", user.id);

  // Exclude already-connected users so they don't appear as new strangers
  if (connectedIds.length > 0) {
    othersQuery = othersQuery.not("id", "in", `(${connectedIds.join(",")})`);
  }

  const { data: others } = await othersQuery.limit(10);

  if (others && others.length > 0) {
    const { data: cards } = await supabase
      .from("DatingCard")
      .select("userId, onSupport, onSafety, onFalling")
      .in("userId", others.map((o) => o.id));

    const cardMap = Object.fromEntries((cards ?? []).map((c) => [c.userId, c]));

    discoverCards = others
      .filter((o) => cardMap[o.id])
      .map((o) => ({
        ...o,
        cardPreview:
          cardMap[o.id]?.onSupport ||
          cardMap[o.id]?.onSafety ||
          cardMap[o.id]?.onFalling ||
          null,
      }))
      .filter((o) => o.cardPreview);
  }

  // How many card questions they actually answered
  const cardFields = ["onSupport", "onSafety", "onFalling"] as const;
  const answeredCount = card ? cardFields.filter((f) => card[f]).length : 0;
  const cardComplete = answeredCount === cardFields.length;

  return (
    <div className="space-y-8">

      {/* ── WELCOME HEADER ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Hey, {profile?.username} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSafeSpace
            ? "Your space. Your voice. Always."
            : "Ready to understand a little more today?"}
        </p>
      </div>

      {/* ── NO CARD BANNER — only show if card not filled ── */}
      {!card && (
        <Link
          href="/card"
          className="flex items-start gap-4 p-4 rounded-2xl border-2 border-dashed border-primary/40 bg-lavender-50 hover:border-primary hover:bg-lavender-50/80 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl safe-space-gradient flex items-center justify-center flex-shrink-0 text-white shadow-soft">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              You&apos;re invisible right now
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Fill your How to Date Me card so people can find and resonate with you.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        </Link>
      )}

      {/* ── QUICK ACTIONS ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Jump in
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {isSafeSpace ? (
            <>
              <QuickAction
                href="/rant-room"
                icon={<PenLine className="w-5 h-5" />}
                label="Write"
                description="What you can't text him. Write it here."
                gradient="safe-space-gradient"
              />
              <QuickAction
                href="/card"
                icon={<CreditCard className="w-5 h-5" />}
                label="Date Me Card"
                description="The user manual for your heart."
                gradient="learning-gradient"
              />
              <QuickAction
                href="/resonances"
                icon={<Heart className="w-5 h-5" />}
                label="Resonances"
                description="See who your card moved."
                gradient="safe-space-gradient"
              />
            </>
          ) : (
            <>
              <QuickAction
                href="/lessons"
                icon={<BookOpen className="w-5 h-5" />}
                label="Read"
                description="What she wished you understood."
                gradient="learning-gradient"
              />
              <QuickAction
                href="/drills"
                icon={<Sparkles className="w-5 h-5" />}
                label="Drills"
                description="Would you have got it right?"
                gradient="safe-space-gradient"
              />
              <QuickAction
                href="/card"
                icon={<CreditCard className="w-5 h-5" />}
                label="Date Me Card"
                description="The user manual for your heart."
                gradient="learning-gradient"
              />
            </>
          )}
        </div>
      </div>

      {/* ── CARD PREVIEW ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Your How to Date Me card
        </h2>

        {card ? (
          <div className="card-soft p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-foreground mb-0.5">
                  {profile?.username}&apos;s card
                </div>
                <div className="text-xs text-muted-foreground">
                  {cardComplete ? "Fully filled in" : `${answeredCount} of 8 questions answered`}
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full mt-1 ${cardComplete ? "bg-green-400" : "bg-peach-400"}`} />
            </div>

            {card.onSupport && (
              <div className="bg-muted rounded-xl p-4 mb-3">
                <div className="text-xs font-semibold text-primary mb-1">On support</div>
                <p className="text-sm text-foreground leading-relaxed line-clamp-2">
                  {card.onSupport}
                </p>
              </div>
            )}

            <Link
              href="/card"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline font-medium mt-2"
            >
              {cardComplete ? "View full card" : "Continue filling in"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="card-soft p-6 text-center border-dashed">
            <Heart className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              You haven&apos;t filled out your card yet.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
            >
              Fill it out now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* ── DISCOVER CARDS — mutual browsing for everyone ── */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Browse cards
        </h2>

        {discoverCards.length === 0 ? (
          <div className="card-soft p-8 text-center">
            <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No cards yet.</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              When people fill out their How to Date Me cards, you&apos;ll find them here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {discoverCards.map((person) => (
              <Link
                key={person.id}
                href={`/profile/${person.username}`}
                className="card-soft p-5 flex items-start gap-3 hover:shadow-lavender transition-all group block"
              >
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  {person.avatarUrl ? (
                    <img src={person.avatarUrl} alt={person.username} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors mb-0.5">
                    {person.username}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {person.cardPreview}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  description,
  gradient,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="card-soft p-5 flex items-start gap-3 hover:shadow-lavender hover:-translate-y-0.5 transition-all group"
    >
      <div
        className={`w-9 h-9 rounded-xl ${gradient} flex items-center justify-center flex-shrink-0 text-white shadow-soft`}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {label}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
    </Link>
  );
}
