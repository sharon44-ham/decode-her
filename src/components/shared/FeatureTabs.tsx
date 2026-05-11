"use client";

// "use client" tells Next.js this component runs in the browser, not the server.
// We need it here because we're using useState — which tracks which tab is active.
// Server components can't do that because they run once on the server and send HTML.
// Think of it like: server component = Express rendering a template,
// client component = the interactive JS that runs after the page loads.

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, PenLine, Heart } from "lucide-react";

type Tab = "rants" | "stories";

export default function FeatureTabs() {
  const [active, setActive] = useState<Tab>("rants");

  return (
    <div>
      {/* ── Tab Pills ── */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { id: "rants"   as Tab, label: "Rant Space" },
          { id: "stories" as Tab, label: "Stories"    },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              active === tab.id
                ? "bg-primary text-white shadow-soft"
                : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="card-soft overflow-hidden">

        {/* RANT SPACE */}
        {active === "rants" && (
          <>
            <div className="px-7 pt-7 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold">The Rant Space</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blush-50 text-blush-500 border border-blush-100 px-2.5 py-0.5 rounded-full">
                    <Lock className="w-2.5 h-2.5" /> Women post · Everyone reads
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Raw, unfiltered, anonymous — exactly what nobody says out loud but everyone needs to hear.
                </p>
              </div>
              <Link
                href="/auth/signup"
                className="shrink-0 text-sm font-semibold text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
              >
                Read more <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {[
                {
                  text: "Why do men go completely silent after the best date of my life?? Like we talked for 5 hours and then nothing. What even is that.",
                  reactions: { "❤️": 241, "🙌": 189, "💯": 312 },
                  time: "2h ago",
                },
                {
                  text: "He remembered I hate cilantro three months later and ordered around it without making it a big deal. That's it. That's literally all we want. Just pay attention.",
                  reactions: { "❤️": 518, "🙌": 402, "💯": 367 },
                  time: "5h ago",
                },
                {
                  text: "Can we normalize saying 'I'm not looking for anything serious' BEFORE someone catches feelings and not after? Asking for every woman ever.",
                  reactions: { "❤️": 703, "🙌": 614, "💯": 891 },
                  time: "1d ago",
                },
              ].map((rant, i) => (
                <div key={i} className="px-7 py-5">
                  <p className="text-sm text-foreground leading-relaxed mb-3">{rant.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {Object.entries(rant.reactions).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          className="flex items-center gap-1 text-xs text-muted-foreground bg-muted hover:bg-lavender-100 px-2.5 py-1 rounded-full transition-colors"
                        >
                          {emoji} {count}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{rant.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Blurred teaser */}
            <div className="relative px-7 py-5 border-t border-border">
              <div className="blur-sm pointer-events-none select-none">
                <p className="text-sm text-foreground leading-relaxed">
                  I finally told him exactly how his texting habits made me feel and he said I was being &ldquo;too much&rdquo;. The bar is on the floor and somehow they still can&apos;t clear it...
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-soft"
                >
                  Keep reading <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </>
        )}


        {/* STORIES */}
        {active === "stories" && (
          <>
            <div className="px-7 pt-7 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold">Stories</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-peach-50 text-peach-400 border border-peach-100 px-2.5 py-0.5 rounded-full">
                    <PenLine className="w-2.5 h-2.5" /> Real experiences
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Beyond swiping and ghosting — get to know the person behind the profile.
                </p>
              </div>
              <Link
                href="/auth/signup"
                className="shrink-0 text-sm font-semibold text-primary hover:opacity-70 transition-opacity flex items-center gap-1"
              >
                Read all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-border">
              {[
                {
                  type: "Story",
                  title: "How to actually check in on someone without it feeling like an interview",
                  preview: "There's a difference between asking 'how was your day' on autopilot and actually wanting to know. Here's what that actually looks like...",
                  tag: "Communication",
                  tagColor: "bg-lavender-50 text-primary border-lavender-100",
                  hearts: 342,
                },
                {
                  type: "Story",
                  title: "The moment I realised he wasn't emotionally unavailable — I just wasn't being specific enough",
                  preview: "I used to think he just didn't care. Turns out I was giving signals I thought were obvious and getting frustrated when he missed them...",
                  tag: "Understanding",
                  tagColor: "bg-blush-50 text-blush-500 border-blush-100",
                  hearts: 589,
                },
                {
                  type: "Story",
                  title: "Why 'I'm fine' is never actually fine — and what to do when she says it",
                  preview: "It's not a trap. It's a test of whether you'll push past the surface. Here's what she actually wants when she says it...",
                  tag: "Texting",
                  tagColor: "bg-peach-50 text-peach-400 border-peach-100",
                  hearts: 721,
                },
              ].map((post, i) => (
                <Link key={i} href="/auth/signup" className="flex items-start justify-between gap-4 px-7 py-5 hover:bg-muted/40 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${post.tagColor}`}>
                        {post.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">{post.type}</span>
                    </div>
                    <p className="font-semibold text-sm text-foreground mb-1.5 leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{post.preview}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 pt-1">
                    <Heart className="w-3.5 h-3.5 fill-blush-300 text-blush-300" />
                    {post.hearts}
                  </div>
                </Link>
              ))}
            </div>

            <div className="relative px-7 py-5 border-t border-border">
              <div className="blur-sm pointer-events-none select-none">
                <p className="text-sm text-foreground leading-relaxed">
                  He never once asked me what I needed after a hard day. Not once in eight months. I didn&apos;t realise how much that mattered until someone finally did...
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-soft"
                >
                  Keep reading <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </>
        )}

      </div>

    </div>
  );
}
