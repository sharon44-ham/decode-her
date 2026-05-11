"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Experience } from "@/types";
import Link from "next/link";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";

type Step = 1 | 2;

interface FormData {
  email: string;
  password: string;
  username: string;
  genderIdentity: string;
  experience: Experience | null;
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    username: "",
    genderIdentity: "",
    experience: null,
  });

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // When gender changes, auto-derive experience. Non-binary clears it until they pick inline.
  function updateGender(value: string) {
    const experience =
      value === "woman" ? "SAFE_SPACE" : value === "man" ? "LEARNING" : null;
    setForm((prev) => ({
      ...prev,
      genderIdentity: value,
      experience: experience as Experience | null,
    }));
  }

  async function handleSubmit() {
    if (!form.genderIdentity || !form.experience) return;
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          genderIdentity: form.genderIdentity,
          experience: form.experience,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: dbError } = await supabase.from("User").insert({
        id: data.user.id,
        email: form.email,
        username: form.username,
        genderIdentity: form.genderIdentity,
        experience: form.experience,
      });

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/onboarding");
      } else {
        router.push("/auth/verify-email");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-xl safe-space-gradient flex items-center justify-center shadow-soft">
          <Heart className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-foreground">
          decode<span className="text-primary">her</span>
        </span>
      </div>

      <div className="w-full max-w-md">
        {/* 2-dot progress bar */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step ? "bg-primary w-8" : "bg-border w-4"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <Step1
            form={form}
            update={update}
            onNext={() => { setError(""); setStep(2); }}
            error={error}
          />
        )}
        {step === 2 && (
          <Step2
            form={form}
            updateGender={updateGender}
            update={update}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />
        )}

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Step1({
  form,
  update,
  onNext,
  error,
}: {
  form: FormData;
  update: (field: keyof FormData, value: string) => void;
  onNext: () => void;
  error: string;
}) {
  const canContinue =
    form.email.includes("@") && form.password.length >= 8 && form.username.length >= 3;

  return (
    <div className="card-soft p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
      <p className="text-sm text-muted-foreground mb-6">Start your journey with DECODE HER</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            placeholder="how people will know you"
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="at least 8 characters"
            onKeyDown={(e) => e.key === "Enter" && canContinue && onNext()}
            className="w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm"
          />
        </div>
      </div>

      {error && <p className="text-sm text-blush-500 mt-3">{error}</p>}

      <button
        onClick={onNext}
        disabled={!canContinue}
        className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
      >
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

const IDENTITY_OPTIONS = [
  { label: "Woman", value: "woman" },
  { label: "Man", value: "man" },
  { label: "Non-binary", value: "non-binary" },
];

function Step2({
  form,
  updateGender,
  update,
  onBack,
  onSubmit,
  loading,
  error,
}: {
  form: FormData;
  updateGender: (value: string) => void;
  update: (field: keyof FormData, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
}) {
  // Can submit if gender chosen + (not non-binary OR experience also chosen)
  const canSubmit =
    !!form.genderIdentity &&
    (form.genderIdentity !== "non-binary" || !!form.experience);

  return (
    <div className="card-soft p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <h1 className="text-2xl font-bold text-foreground mb-1">How do you identify?</h1>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Always yours to change from your profile.
      </p>

      {/* Gender pills */}
      <div className="grid grid-cols-3 gap-3">
        {IDENTITY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateGender(opt.value)}
            className={`py-4 rounded-2xl text-sm font-semibold border-2 transition-all ${
              form.genderIdentity === opt.value
                ? "bg-primary text-white border-primary shadow-soft"
                : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Inline choice — only shows when Non-binary is selected */}
      {form.genderIdentity === "non-binary" && (
        <div className="mt-4 p-4 rounded-xl bg-muted border border-border">
          <p className="text-xs text-muted-foreground mb-3 font-medium">What brings you here?</p>
          <div className="flex gap-2">
            <button
              onClick={() => update("experience", "SAFE_SPACE")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                form.experience === "SAFE_SPACE"
                  ? "border-primary bg-primary text-white"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              I want to be seen and heard
            </button>
            <button
              onClick={() => update("experience", "LEARNING")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                form.experience === "LEARNING"
                  ? "border-primary bg-primary text-white"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              I want to understand better
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-blush-500 mt-4">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={!canSubmit || loading}
        className="w-full mt-6 flex items-center justify-center gap-2 bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
      >
        {loading ? "Creating your account..." : <>Join DECODE HER <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}
