import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DrillsClient from "./DrillsClient";

export default async function DrillsPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: drills } = await supabase
    .from("Drill")
    .select("id, scenario, context, optionA, optionB, optionC, optionD, bestOption, explanation, category");

  // Which drills has the user already attempted?
  const drillIds = (drills ?? []).map((d) => d.id);
  const { data: attempts } = drillIds.length
    ? await supabase
        .from("DrillAttempt")
        .select("drillId, chosen, correct")
        .eq("userId", user.id)
        .in("drillId", drillIds)
    : { data: [] };

  const attemptMap = Object.fromEntries(
    (attempts ?? []).map((a) => [a.drillId, { chosen: a.chosen, correct: a.correct }])
  );

  const enriched = (drills ?? []).map((d) => ({
    ...d,
    attempt: attemptMap[d.id] ?? null,
  }));

  return <DrillsClient drills={enriched} userId={user.id} />;
}
