import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

interface Props {
  params: { username: string };
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("User")
    .select("id, username, experience, genderIdentity, avatarUrl, bio, createdAt")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const isOwnProfile = authUser.id === profile.id;

  const [cardRes, viewerRes, resonanceRes, conversationRes] = await Promise.all([
    supabase.from("DatingCard").select("*").eq("userId", profile.id).single(),
    supabase.from("User").select("id, username, experience").eq("id", authUser.id).single(),
    // Resonance they sent TO this profile
    supabase
      .from("Resonance")
      .select("id, status")
      .eq("fromUserId", authUser.id)
      .eq("toUserId", profile.id)
      .maybeSingle(),
    // Existing conversation between these two users (either direction)
    isOwnProfile
      ? Promise.resolve({ data: null })
      : supabase
          .from("Conversation")
          .select("id")
          .or(
            `and(user1Id.eq.${authUser.id},user2Id.eq.${profile.id}),and(user1Id.eq.${profile.id},user2Id.eq.${authUser.id})`
          )
          .maybeSingle(),
  ]);

  const viewer = viewerRes.data;
  const canResonate = !isOwnProfile && !!viewer;

  return (
    <ProfileClient
      profile={profile}
      card={cardRes.data}
      viewer={viewer}
      isOwnProfile={isOwnProfile}
      canResonate={canResonate}
      existingResonance={resonanceRes.data ?? null}
      existingConversation={conversationRes.data ?? null}
    />
  );
}
