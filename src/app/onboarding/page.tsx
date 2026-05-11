import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

// Server Component — runs on the server before anything renders
// Checks: are you logged in? do you already have a card?
export default async function OnboardingPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // If they already filled out their card, skip onboarding
  const { data: existingCard } = await supabase
    .from("DatingCard")
    .select("id")
    .eq("userId", user.id)
    .single();

  if (existingCard) {
    redirect("/dashboard");
  }

  // Fetch their profile so we can greet them by username
  const { data: profile } = await supabase
    .from("User")
    .select("username, experience")
    .eq("id", user.id)
    .single();

  return (
    <OnboardingClient
      userId={user.id}
      username={profile?.username ?? ""}
      experience={profile?.experience ?? "SAFE_SPACE"}
    />
  );
}
