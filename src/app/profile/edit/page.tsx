import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileEditClient from "./ProfileEditClient";

export default async function ProfileEditPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("User")
    .select("id, username, bio, genderIdentity, avatarUrl, experience")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/dashboard");

  return <ProfileEditClient profile={profile} />;
}
