import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CardClient from "./CardClient";

export default async function CardPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileRes, cardRes] = await Promise.all([
    supabase.from("User").select("username").eq("id", user.id).single(),
    supabase.from("DatingCard").select("*").eq("userId", user.id).single(),
  ]);

  // No card at all — they skipped onboarding somehow, send them back
  if (!cardRes.data) redirect("/onboarding");

  return (
    <CardClient
      card={cardRes.data}
      userId={user.id}
      username={profileRes.data?.username ?? ""}
    />
  );
}
