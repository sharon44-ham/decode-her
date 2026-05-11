import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft, MessageCircle, User } from "lucide-react";

export default async function MessagesPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: conversations } = await supabase
    .from("Conversation")
    .select("id, user1Id, user2Id, user1LastReadAt, user2LastReadAt, createdAt")
    .or(`user1Id.eq.${user.id},user2Id.eq.${user.id}`);

  const otherUserIds = (conversations ?? []).map((c) =>
    c.user1Id === user.id ? c.user2Id : c.user1Id
  );

  const { data: otherUsers } = otherUserIds.length
    ? await supabase
        .from("User")
        .select("id, username, avatarUrl")
        .in("id", otherUserIds)
    : { data: [] };

  const userMap = Object.fromEntries((otherUsers ?? []).map((u) => [u.id, u]));

  const convIds = (conversations ?? []).map((c) => c.id);
  const { data: allMessages } = convIds.length
    ? await supabase
        .from("Message")
        .select("conversationId, content, createdAt, senderId")
        .in("conversationId", convIds)
        .order("createdAt", { ascending: false })
    : { data: [] };

  // Last message per conversation (content + time + sender)
  const lastMsgMap: Record<string, { content: string; senderId: string; createdAt: string }> = {};
  (allMessages ?? []).forEach((m) => {
    if (!lastMsgMap[m.conversationId]) {
      lastMsgMap[m.conversationId] = { content: m.content, senderId: m.senderId, createdAt: m.createdAt };
    }
  });

  // Sort conversations: most recently messaged first, fallback to conversation createdAt
  const sorted = [...(conversations ?? [])].sort((a, b) => {
    const aTime = lastMsgMap[a.id]?.createdAt ?? a.createdAt;
    const bTime = lastMsgMap[b.id]?.createdAt ?? b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });

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

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Messages</h1>
          <p className="text-sm text-muted-foreground">Your conversations with people you connected with.</p>
        </div>

        {!sorted.length ? (
          <div className="card-soft p-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No conversations yet.</p>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              When you accept a resonance, a conversation opens here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((conv) => {
              const otherId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
              const other = userMap[otherId];
              const last = lastMsgMap[conv.id];
              const myLastRead = conv.user1Id === user.id ? conv.user1LastReadAt : conv.user2LastReadAt;

              // Unread: last message is from the other person and newer than what I last read
              const isUnread =
                last &&
                last.senderId !== user.id &&
                (!myLastRead || new Date(last.createdAt) > new Date(myLastRead));

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="card-soft p-4 flex items-center gap-3 hover:shadow-lavender transition-all group"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-muted border border-border flex items-center justify-center">
                      {other?.avatarUrl ? (
                        <img src={other.avatarUrl} alt={other.username} className="w-11 h-11 rounded-xl object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {isUnread && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm transition-colors group-hover:text-primary ${isUnread ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                      {other?.username ?? "Unknown"}
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${isUnread ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {last
                        ? (last.senderId === user.id ? `You: ${last.content}` : last.content)
                        : "No messages yet — say something"}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
