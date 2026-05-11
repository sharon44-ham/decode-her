import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChatClient from "./ChatClient";

interface Props {
  params: { conversationId: string };
}

export default async function ChatPage({ params }: Props) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify user belongs to this conversation
  const { data: conv } = await supabase
    .from("Conversation")
    .select("id, user1Id, user2Id")
    .eq("id", params.conversationId)
    .single();

  if (!conv) notFound();
  if (conv.user1Id !== user.id && conv.user2Id !== user.id) redirect("/messages");

  // Mark as read — update before rendering so layout sees it immediately on back-navigation
  const readField = conv.user1Id === user.id ? "user1LastReadAt" : "user2LastReadAt";
  await supabase
    .from("Conversation")
    .update({ [readField]: new Date().toISOString() })
    .eq("id", params.conversationId);

  // Get other person's profile
  const otherId = conv.user1Id === user.id ? conv.user2Id : conv.user1Id;
  const { data: otherUser } = await supabase
    .from("User")
    .select("id, username, avatarUrl")
    .eq("id", otherId)
    .single();

  // Fetch initial messages (last 50)
  const { data: messages } = await supabase
    .from("Message")
    .select("id, senderId, content, createdAt")
    .eq("conversationId", params.conversationId)
    .order("createdAt", { ascending: true })
    .limit(50);

  return (
    <ChatClient
      conversationId={params.conversationId}
      currentUserId={user.id}
      isUser1={conv.user1Id === user.id}
      otherUser={otherUser ?? { id: otherId, username: "Unknown", avatarUrl: null }}
      initialMessages={messages ?? []}
    />
  );
}
