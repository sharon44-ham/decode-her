import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import RantRoomClient from "../rant-room/RantRoomClient";

export default async function LessonsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: rawPosts } = await supabase
    .from("Post")
    .select("id, userId, title, content, category, type, isAnonymous, createdAt")
    .eq("published", true)
    .order("createdAt", { ascending: false })
    .limit(40);

  const authorIds = [...new Set((rawPosts ?? []).map((p) => p.userId))];
  const { data: authors } = authorIds.length
    ? await supabase.from("User").select("id, username, avatarUrl").in("id", authorIds)
    : { data: [] };

  const authorMap = Object.fromEntries((authors ?? []).map((a) => [a.id, a]));

  const postIds = (rawPosts ?? []).map((p) => p.id);
  const { data: reactions } = postIds.length
    ? await supabase.from("Reaction").select("postId, userId, type").in("postId", postIds)
    : { data: [] };

  const reactionData: Record<string, { counts: Record<string, number>; mine: string | null }> = {};
  (rawPosts ?? []).forEach((p) => { reactionData[p.id] = { counts: {}, mine: null }; });
  (reactions ?? []).forEach((r) => {
    if (!reactionData[r.postId]) return;
    reactionData[r.postId].counts[r.type] = (reactionData[r.postId].counts[r.type] ?? 0) + 1;
    if (r.userId === user.id) reactionData[r.postId].mine = r.type;
  });

  const posts = (rawPosts ?? []).map((p) => ({
    ...p,
    author: p.isAnonymous ? null : (authorMap[p.userId] ?? null),
    reactionCounts: reactionData[p.id]?.counts ?? {},
    myReaction: reactionData[p.id]?.mine ?? null,
  }));

  return (
    <RantRoomClient
      posts={posts}
      currentUserId={user.id}
      canPost={false}
    />
  );
}
