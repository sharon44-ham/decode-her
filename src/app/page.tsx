import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import FeatureTabs from "@/components/shared/FeatureTabs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAV ── */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl safe-space-gradient flex items-center justify-center shadow-soft">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            decode<span className="text-primary">her</span>
          </span>
        </div>
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="hero-gradient">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">

          <div className="inline-flex items-center bg-white border border-lavender-200 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-8 shadow-soft">
            Done with swipe culture? Same.
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-[1.15]">
            Real talk.{" "}
            <span className="bg-gradient-to-r from-primary via-lavender-400 to-blush-400 bg-clip-text text-transparent">
              From women
            </span>
            {" "}who&apos;ve{" "}
            <span className="relative inline-block">
              been there.
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-blush-400 rounded-full opacity-50" />
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Women share their real experiences, frustrations, and lessons.
            Men show up and actually learn from them.
            No guessing. No algorithms. Just humans finally getting each other.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-semibold text-base hover:opacity-90 transition-all glow-primary shadow-glow"
            >
              Find your match <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-6 py-3.5 text-base"
            >
              See what&apos;s inside
            </Link>
          </div>

        </div>
      </section>

      {/* ── FEATURE TABS ── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-24">
        <FeatureTabs />
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <h2 className="text-2xl font-bold text-center mb-10">What people are saying</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              quote: "I posted a rant about how men respond when I cry and somehow it became a whole lesson on the platform. Wild.",
              name: "Priya, 24",
              tag: "Rant Space",
              bg: "bg-blush-50 border-blush-100",
              tagCol: "text-blush-500",
            },
            {
              quote: "The empathy drills made me realize I kept doing the thing my ex hated most — and I didn't even notice.",
              name: "Marcus, 26",
              tag: "Stories",
              bg: "bg-lavender-50 border-lavender-100",
              tagCol: "text-primary",
            },
            {
              quote: "Filling out the 'How to Date Me' card took me an hour. I cried twice. Genuinely got to know myself.",
              name: "Jordan, 27",
              tag: "Date Me Card",
              bg: "bg-peach-50 border-peach-100",
              tagCol: "text-peach-400",
            },
          ].map(({ quote, name, tag, bg, tagCol }) => (
            <div key={name} className={`card-soft p-6 border ${bg}`}>
              <p className="text-sm text-foreground leading-relaxed mb-4">&ldquo;{quote}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-medium">{name}</span>
                <span className={`text-xs font-semibold ${tagCol}`}>{tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="safe-space-gradient rounded-3xl p-12 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[
              { size: 80, top: "-10%", left: "5%",  rotate: 15  },
              { size: 50, top: "60%",  left: "2%",  rotate: -20 },
              { size: 60, top: "10%",  left: "88%", rotate: 30  },
              { size: 40, top: "70%",  left: "90%", rotate: -10 },
              { size: 30, top: "40%",  left: "50%", rotate: 45  },
            ].map((s, i) => (
              <Heart
                key={i}
                className="absolute fill-white/10 text-white/10"
                style={{ width: s.size, height: s.size, top: s.top, left: s.left, transform: `rotate(${s.rotate}deg)` }}
              />
            ))}
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-3">Matches are easy. Understanding each other isn&apos;t. Until now.</h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto leading-relaxed">
              It starts with your card. Takes ten minutes.
              Might change how you date forever.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3.5 rounded-full font-bold text-base hover:opacity-95 transition-opacity shadow-card"
            >
              Skip the small talk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg safe-space-gradient flex items-center justify-center">
            <Heart className="w-3 h-3 text-white fill-white" />
          </div>
          <span className="font-bold text-foreground">decodeher</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Because dating shouldn&apos;t feel like a guessing game.
        </p>
      </footer>

    </div>
  );
}
