import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ResonancesClient from "./ResonancesClient";

export default async function ResonancesPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("User")
    .select("experience, username")
    .eq("id", user.id)
    .single();

  const { data: resonances } = await supabase
    .from("Resonance")
    .select("id, cardQuoteField, cardQuoteText, message, status, createdAt, fromUserId")
    .eq("toUserId", user.id)
    .order("createdAt", { ascending: false });

  const senderIds = (resonances ?? []).map((r) => r.fromUserId);
  const { data: senders } = senderIds.length
    ? await supabase
        .from("User")
        .select("id, username, avatarUrl, genderIdentity")
        .in("id", senderIds)
    : { data: [] };

  const senderMap = Object.fromEntries((senders ?? []).map((s) => [s.id, s]));

  // Fetch existing conversations for accepted resonances
  const acceptedIds = (resonances ?? [])
    .filter((r) => r.status === "ACCEPTED")
    .map((r) => r.id);

  const { data: conversations } = acceptedIds.length
    ? await supabase
        .from("Conversation")
        .select("resonanceId, id")
        .in("resonanceId", acceptedIds)
    : { data: [] };

  const convMap = Object.fromEntries(
    (conversations ?? []).map((c) => [c.resonanceId, c.id])
  );

  const enriched = (resonances ?? []).map((r) => ({
    ...r,
    sender: senderMap[r.fromUserId] ?? null,
    conversationId: convMap[r.id] ?? null,
  }));

  const pending = enriched.filter((r) => r.status === "PENDING");
  const accepted = enriched.filter((r) => r.status === "ACCEPTED");

  return (
    <ResonancesClient
      pending={pending}
      accepted={accepted}
      username={profile?.username ?? ""}
      userId={user.id}
    />
  );
}
