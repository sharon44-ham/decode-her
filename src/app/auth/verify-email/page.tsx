import Link from "next/link";
import { Heart, Mail } from "lucide-react";

export default function VerifyEmailPage() {
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

      <div className="w-full max-w-md card-soft p-8 text-center">
        <div className="w-14 h-14 rounded-2xl safe-space-gradient flex items-center justify-center mx-auto mb-5 shadow-soft">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Check your email</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          We sent a confirmation link to your inbox. Click it to activate your account and start your journey with DECODE HER.
        </p>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            try signing up again
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
