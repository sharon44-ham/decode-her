import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, LayoutDashboard, BookOpen, MessageCircle, CreditCard, User, MessagesSquare } from "lucide-react";
import LogoutButton from "@/components/shared/LogoutButton";
import NavRefresher from "@/components/shared/NavMessageDot";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("User")
    .select("username, experience, avatarUrl")
    .eq("id", user.id)
    .single();

  const isSafeSpace = profile?.experience === "SAFE_SPACE";

  const { count: pendingCount } = await supabase
    .from("Resonance")
    .select("id", { count: "exact", head: true })
    .eq("toUserId", user.id)
    .eq("status", "PENDING");

  const { data: convs } = await supabase
    .from("Conversation")
    .select("id, user1Id, user2Id, user1LastReadAt, user2LastReadAt")
    .or(`user1Id.eq.${user.id},user2Id.eq.${user.id}`);

  const convIds = (convs ?? []).map((c) => c.id);
  let messageDot = false;

  if (convIds.length > 0) {
    const { data: latestMsgs } = await supabase
      .from("Message")
      .select("conversationId, createdAt")
      .in("conversationId", convIds)
      .neq("senderId", user.id)
      .order("createdAt", { ascending: false });

    const latestMap: Record<string, string> = {};
    (latestMsgs ?? []).forEach((m) => {
      if (!latestMap[m.conversationId]) latestMap[m.conversationId] = m.createdAt;
    });

    for (const conv of convs ?? []) {
      const latest = latestMap[conv.id];
      if (!latest) continue;
      const myLastRead = conv.user1Id === user.id ? conv.user1LastReadAt : conv.user2LastReadAt;
      if (!myLastRead || new Date(latest) > new Date(myLastRead)) {
        messageDot = true;
        break;
      }
    }
  }

  const navLinks = isSafeSpace
    ? [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard, badge: 0 },
        { href: "/rant-room", label: "Write", icon: MessageCircle, badge: 0 },
        { href: "/resonances", label: "Resonances", icon: Heart, badge: pendingCount ?? 0 },
        { href: "/messages", label: "Messages", icon: MessagesSquare, badge: messageDot ? -1 : 0 },
        { href: "/card", label: "My Card", icon: CreditCard, badge: 0 },
      ]
    : [
        { href: "/dashboard", label: "Home", icon: LayoutDashboard, badge: 0 },
        { href: "/lessons", label: "Lessons", icon: BookOpen, badge: 0 },
        { href: "/resonances", label: "Resonances", icon: Heart, badge: pendingCount ?? 0 },
        { href: "/messages", label: "Messages", icon: MessagesSquare, badge: messageDot ? -1 : 0 },
        { href: "/card", label: "My Card", icon: CreditCard, badge: 0 },
      ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg safe-space-gradient flex items-center justify-center shadow-soft">
              <Heart className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-foreground">
              decode<span className="text-primary">her</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon, badge }) => (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <span className="relative">
                  <Icon className="w-3.5 h-3.5" />
                  {badge === -1 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  )}
                </span>
                {label}
                {badge > 0 && (
                  <span className="ml-0.5 bg-primary text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <LogoutButton />

          <Link href={`/profile/${profile?.username}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <span className="hidden md:block text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              {profile?.username}
            </span>
          </Link>
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex border-t border-border">
          {navLinks.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <span className="relative">
                <Icon className="w-4 h-4" />
                {badge === -1 && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
                )}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5 leading-none">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              {label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Polls server every 15s to keep badge counts current without WebSocket complexity */}
      <NavRefresher />
    </div>
  );
}
