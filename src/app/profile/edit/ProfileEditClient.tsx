"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft, User, Check } from "lucide-react";

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  genderIdentity: string | null;
  avatarUrl: string | null;
  experience: string;
}

const GENDER_OPTIONS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "non-binary", label: "Non-binary" },
];

export default function ProfileEditClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: profile.username,
    bio: profile.bio ?? "",
    genderIdentity: profile.genderIdentity ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!form.username.trim()) return;
    setSaving(true);
    setSaved(false);
    setError("");

    const supabase = createClient();

    const { error: dbError } = await supabase
      .from("User")
      .update({
        username: form.username.trim(),
        bio: form.bio.trim() || null,
        genderIdentity: form.genderIdentity || null,
      })
      .eq("id", profile.id);

    if (dbError) {
      setError(dbError.message);
    } else {
      setSaved(true);
      setTimeout(() => {
        router.push(`/profile/${form.username.trim()}`);
      }, 1000);
    }

    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg safe-space-gradient flex items-center justify-center shadow-soft">
              <Heart className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-foreground">
              decode<span className="text-primary">her</span>
            </span>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Edit profile</h1>
          <p className="text-sm text-muted-foreground">How others see you on DECODE HER.</p>
        </div>

        {/* Avatar placeholder */}
        <div className="card-soft p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center flex-shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            ) : (
              <User className="w-7 h-7 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{form.username}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Avatar upload coming soon.</p>
          </div>
        </div>

        {/* Username */}
        <div className="card-soft p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="your username"
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A few words about you (optional)"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm resize-none"
            />
            <div className="flex justify-end mt-1">
              <span className="text-xs text-muted-foreground">{form.bio.length}/200</span>
            </div>
          </div>
        </div>

        {/* Gender identity */}
        <div className="card-soft p-6 space-y-3">
          <label className="block text-sm font-semibold text-foreground">Gender identity</label>
          <div className="grid grid-cols-3 gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, genderIdentity: opt.value }))}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  form.genderIdentity === opt.value
                    ? "bg-primary text-white border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Note: changing gender doesn&apos;t change your experience type (SAFE_SPACE / LEARNING).
            That stays as you set it at signup.
          </p>
        </div>

        {error && <p className="text-sm text-blush-500">{error}</p>}

        <div className="pb-8">
          <button
            onClick={handleSave}
            disabled={saving || !form.username.trim()}
            className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 glow-primary flex items-center justify-center gap-2"
          >
            {saved ? (
              <><Check className="w-4 h-4" /> Saved — taking you back</>
            ) : saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </main>
    </div>
  );
}
