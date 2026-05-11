"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Heart, ArrowLeft, PenLine, X, User } from "lucide-react";

interface Post {
  id: string;
  userId: string;
  title: string | null;
  content: string;
  category: string;
  type: string;
  isAnonymous: boolean;
  createdAt: string;
  author: { id: string; username: string; avatarUrl: string | null } | null;
  reactionCounts: Record<string, number>;
  myReaction: string | null;
}

interface Props {
  posts: Post[];
  currentUserId: string;
  canPost: boolean;
}

const CATEGORIES = [
  { value: "ALL", label: "All" },
  { value: "GENERAL", label: "General" },
  { value: "TEXTING", label: "Texting" },
  { value: "FIRST_DATES", label: "First dates" },
  { value: "CONFLICT", label: "Conflict" },
  { value: "COMMUNICATION", label: "Communication" },
  { value: "BOUNDARIES", label: "Boundaries" },
  { value: "LOVE_LANGUAGES", label: "Love languages" },
  { value: "RED_FLAGS", label: "Red flags" },
  { value: "UNDERSTANDING", label: "Understanding" },
];

const POST_TYPES = [
  { value: "RANT", label: "Rant" },
  { value: "STORY", label: "Story" },
  { value: "TUTORIAL", label: "How-to" },
];

const REACTIONS = [
  { type: "HEART", emoji: "❤️" },
  { type: "FELT_THIS", label: "Felt this" },
  { type: "NEEDED_THIS", label: "Needed this" },
  { type: "HUG", emoji: "🤗" },
];

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function RantRoomClient({ posts: initialPosts, currentUserId, canPost }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [filter, setFilter] = useState("ALL");
  const [composeOpen, setComposeOpen] = useState(false);
  const [reactions, setReactions] = useState<Record<string, { counts: Record<string, number>; mine: string | null }>>(() => {
    const map: Record<string, { counts: Record<string, number>; mine: string | null }> = {};
    initialPosts.forEach((p) => { map[p.id] = { counts: { ...p.reactionCounts }, mine: p.myReaction }; });
    return map;
  });

  const filtered = filter === "ALL" ? posts : posts.filter((p) => p.category === filter);

  async function handleReact(postId: string, type: string) {
    const supabase = createClient();
    const current = reactions[postId];
    const isSame = current?.mine === type;

    // Optimistic update
    setReactions((prev) => {
      const r = { ...prev[postId] };
      if (isSame) {
        r.counts = { ...r.counts, [type]: Math.max((r.counts[type] ?? 1) - 1, 0) };
        r.mine = null;
      } else {
        if (r.mine) r.counts = { ...r.counts, [r.mine]: Math.max((r.counts[r.mine] ?? 1) - 1, 0) };
        r.counts = { ...r.counts, [type]: (r.counts[type] ?? 0) + 1 };
        r.mine = type;
      }
      return { ...prev, [postId]: r };
    });

    if (isSame) {
      await supabase.from("Reaction").delete().eq("postId", postId).eq("userId", currentUserId);
    } else {
      await supabase.from("Reaction").upsert({
        id: crypto.randomUUID(),
        postId,
        userId: currentUserId,
        type,
      }, { onConflict: "postId,userId" });
    }
  }

  function handlePostCreated(post: Post) {
    setPosts((prev) => [post, ...prev]);
    setReactions((prev) => ({ ...prev, [post.id]: { counts: {}, mine: null } }));
  }

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
              {canPost ? "Rant room" : <span>decode<span className="text-primary">her</span></span>}
            </span>
          </div>
          {canPost ? (
            <button
              onClick={() => setComposeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
            >
              <PenLine className="w-3.5 h-3.5" /> Write
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {canPost ? "The rant room." : "What they're saying."}
          </h1>
          <p className="text-sm text-muted-foreground">
            {canPost
              ? "No judgment. No explanations needed. Just say it."
              : "Real words from real people. Read slowly."}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filter === c.value
                  ? "bg-primary text-white border-primary"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className="card-soft p-10 text-center">
            <p className="text-sm font-medium text-foreground mb-1">Nothing here yet.</p>
            <p className="text-sm text-muted-foreground">
              {canPost ? "Be the first to write something." : "Check back soon."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                reaction={reactions[post.id] ?? { counts: {}, mine: null }}
                onReact={(type) => handleReact(post.id, type)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Compose modal */}
      {composeOpen && (
        <ComposeModal
          currentUserId={currentUserId}
          onClose={() => setComposeOpen(false)}
          onPosted={handlePostCreated}
        />
      )}
    </div>
  );
}

function PostCard({
  post,
  reaction,
  onReact,
}: {
  post: Post;
  reaction: { counts: Record<string, number>; mine: string | null };
  onReact: (type: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.content.length > 280;

  return (
    <div className="card-soft p-5 space-y-3">
      {/* Author row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
            {post.author?.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
            ) : (
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">
              {post.author?.username ?? "Anonymous"}
            </div>
            <div className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted border border-border">
            {post.type === "TUTORIAL" ? "How-to" : post.type === "RANT" ? "Rant" : "Story"}
          </span>
          <span className="text-[10px] font-semibold text-primary bg-lavender-50 border border-lavender-100 px-2 py-0.5 rounded-full">
            {CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      {post.title && (
        <p className="text-sm font-semibold text-foreground">{post.title}</p>
      )}
      <p className="text-sm text-foreground leading-relaxed">
        {isLong && !expanded ? `${post.content.slice(0, 280)}…` : post.content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs text-primary hover:underline font-medium"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {/* Reactions */}
      <div className="flex items-center gap-1 pt-1 flex-wrap">
        {REACTIONS.map((r) => {
          const count = reaction.counts[r.type] ?? 0;
          const active = reaction.mine === r.type;
          return (
            <button
              key={r.type}
              onClick={() => onReact(r.type)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                active
                  ? "bg-lavender-50 border-primary text-primary"
                  : "bg-muted border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {"emoji" in r ? r.emoji : r.label}
              {count > 0 && <span>{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ComposeModal({
  currentUserId,
  onClose,
  onPosted,
}: {
  currentUserId: string;
  onClose: () => void;
  onPosted: (post: Post) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "GENERAL",
    type: "RANT",
    isAnonymous: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePost() {
    if (!form.content.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const id = crypto.randomUUID();

    const { error: dbError } = await supabase.from("Post").insert({
      id,
      userId: currentUserId,
      title: form.title.trim() || null,
      content: form.content.trim(),
      category: form.category,
      type: form.type,
      isAnonymous: form.isAnonymous,
      published: true,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    const { data: me } = await supabase
      .from("User").select("id, username, avatarUrl").eq("id", currentUserId).single();

    onPosted({
      id,
      userId: currentUserId,
      title: form.title.trim() || null,
      content: form.content.trim(),
      category: form.category,
      type: form.type,
      isAnonymous: form.isAnonymous,
      createdAt: new Date().toISOString(),
      author: form.isAnonymous ? null : (me ?? null),
      reactionCounts: {},
      myReaction: null,
    });

    onClose();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-background rounded-2xl w-full max-w-lg shadow-lavender max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h3 className="font-bold text-foreground">Say it.</h3>
            <p className="text-xs text-muted-foreground mt-0.5">No filter needed here.</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Type */}
          <div className="flex gap-2">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                  form.type === t.value
                    ? "bg-primary text-white border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title (optional)"
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />

          {/* Content */}
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="What do you need to say?"
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none leading-relaxed"
          />

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter((c) => c.value !== "ALL").map((c) => (
                <button
                  key={c.value}
                  onClick={() => setForm((f) => ({ ...f, category: c.value }))}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.category === c.value
                      ? "bg-primary text-white border-primary"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous toggle */}
          <button
            onClick={() => setForm((f) => ({ ...f, isAnonymous: !f.isAnonymous }))}
            className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 text-sm font-medium transition-all ${
              form.isAnonymous
                ? "border-primary bg-lavender-50 text-primary"
                : "border-border bg-muted text-muted-foreground hover:border-primary/40"
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
              form.isAnonymous ? "border-primary bg-primary" : "border-border"
            }`}>
              {form.isAnonymous && <span className="text-white text-[10px] font-bold">✓</span>}
            </div>
            Post anonymously
          </button>

          {error && <p className="text-sm text-blush-500">{error}</p>}

          <button
            onClick={handlePost}
            disabled={!form.content.trim() || loading}
            className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-40 glow-primary"
          >
            {loading ? "Posting..." : "Post it"}
          </button>
        </div>
      </div>
    </div>
  );
}
