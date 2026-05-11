# DECODE HER — Learning Journal
> Every concept we learn while building this app, explained with real-world examples.
> This file grows as we build. PDF exported at the end.

---

## Table of Contents
1. [What is Next.js and why not just React + Express?](#1-nextjs)
2. [TypeScript — why types matter](#2-typescript)
3. [App Router — how Next.js handles pages](#3-app-router)
4. [Tailwind CSS — styling without writing CSS files](#4-tailwind)
5. [Supabase — your backend without building a backend](#5-supabase)
6. [Prisma — talking to your database safely](#6-prisma)
7. [Authentication — how login works under the hood](#7-auth)
8. [Middleware — the bouncer at the door](#8-middleware)
9. [Server vs Client Components — a critical Next.js concept](#9-server-vs-client)
10. [API Routes — your Express routes, but inside Next.js](#10-api-routes)
11. [Claude API — adding AI to your app](#11-claude-api)
12. [Framer Motion — making things feel alive](#12-framer-motion)
13. [shadcn/ui — a component library done differently](#13-shadcn)

---

## 1. Next.js — What and Why

### What you know
You've been building with **React** (for UI) + **Express** (for the server) as two separate projects. Two repos, two servers, two deployments.

### What Next.js does
Next.js **merges** React and your server into one project. You write React for the UI AND write backend logic (like your Express routes) — all in one codebase.

```
Your current setup:         Next.js setup:
┌─────────────┐             ┌─────────────────────────┐
│  React App  │  ←HTTP→    │     Next.js App          │
│  (port 3000)│             │                          │
└─────────────┘             │  ┌──────┐  ┌─────────┐  │
       +                    │  │  UI  │  │ API     │  │
┌─────────────┐             │  │React │  │ Routes  │  │
│ Express API │             │  └──────┘  └─────────┘  │
│  (port 5000)│             │                          │
└─────────────┘             └─────────────────────────┘
```

### Real-world analogy
Think of **Instagram**. Their website has the photo feed (UI) AND when you like a post it hits their backend (API). Next.js is like having both in one kitchen instead of two separate restaurants serving the same meal.

### Why it matters for interviews
Next.js is used by: Netflix, TikTok, Twitch, GitHub, Nike, Notion. Saying "I built a full-stack app with Next.js" is a strong resume line.

---

## 2. TypeScript — Why Types Matter

### What you know
JavaScript is flexible — you can do `let x = "hello"` then `x = 5` with no complaints.

### What TypeScript adds
TypeScript forces you to declare what type a variable is, and yells at you (at build time, before your app even runs) if you use it wrong.

```typescript
// JavaScript — no error until runtime
function greet(user) {
  return user.name.toUpperCase() // crashes if user is null
}

// TypeScript — error caught WHILE you're writing
function greet(user: { name: string }) {
  return user.name.toUpperCase() // safe, TypeScript guarantees name exists
}
```

### Real-world analogy
Think of TypeScript as **spell-check for your code**. Google Docs underlines spelling mistakes as you type — you don't have to run the document through a checker after. TypeScript does the same for code bugs.

### Why it matters
Every serious company uses TypeScript. It's on almost every senior job description. Building with it from day one makes you hireable faster.

---

## 3. App Router — How Next.js Handles Pages

### The old way (Pages Router)
In the old Next.js system, you'd create files in a `pages/` folder and each file became a URL:
- `pages/index.js` → `yoursite.com/`
- `pages/about.js` → `yoursite.com/about`

### The new way (App Router — what we're using)
Now you use an `app/` folder and each folder becomes a URL segment. Every folder needs a `page.tsx` file inside to become a real page.

```
app/
├── page.tsx              → yoursite.com/
├── dashboard/
│   └── page.tsx          → yoursite.com/dashboard
├── lessons/
│   ├── page.tsx          → yoursite.com/lessons
│   └── [id]/
│       └── page.tsx      → yoursite.com/lessons/abc123
```

### Real-world analogy
Think of it like **folders on your computer**. Your file system has `Documents/Work/Project/report.pdf`. The App Router works the same — the folder path IS the URL path.

### Special files in App Router
| File | What it does |
|------|-------------|
| `page.tsx` | The actual page content |
| `layout.tsx` | Wrapper that wraps all pages inside (navbar, sidebar) |
| `loading.tsx` | Shown while page data loads |
| `error.tsx` | Shown if something crashes |
| `route.ts` | Makes it an API endpoint (like Express routes) |

### The `[id]` folder (Dynamic Routes)
The `[id]` in brackets means "anything can go here." Like Instagram's `instagram.com/[username]` — one page handles every profile.

---

## 4. Tailwind CSS — Styling Without Writing CSS Files

### What you know
Traditional CSS: you write a `.css` file, give things class names, and write properties.

```css
.card { background-color: #18181B; border-radius: 12px; padding: 16px; }
```

### What Tailwind does
Tailwind gives you tiny pre-built utility classes. You style directly in JSX — no CSS files.

```tsx
<div className="bg-card rounded-xl p-4">...</div>
```

### Real-world analogy
Think of Tailwind like **LEGO bricks**. Instead of sculpting each piece from scratch, you snap together pre-made bricks. Instagram's frontend engineers don't write raw CSS for every button — they use design systems like this.

### Key class patterns
```
bg-card         → background-color (our surface color)
rounded-xl      → border-radius: 12px
p-4             → padding: 16px
text-foreground → text color
flex items-center gap-2  → flexbox with 8px gap
hover:bg-primary → change background on hover
```

### Our design tokens (globals.css)
We defined CSS variables (`--background`, `--primary`, etc.) mapped to Tailwind:
- `bg-background` → near-black `#09090B`
- `bg-primary` → violet `#8B5CF6`
- `text-muted-foreground` → grey `#A1A1AA`

### The cn() utility (src/lib/utils.ts)
```typescript
cn("bg-card p-4", isActive && "bg-primary")
// → "bg-card p-4 bg-primary" when active
// → "bg-card p-4" when not active
```
Safely merges Tailwind classes — used in every component.

---

## 5. Supabase — Your Backend Without Building a Backend

*(To be filled in when we connect Supabase)*

---

## 6. Prisma — Talking to Your Database Safely

*(To be filled in when we write the schema)*

---

## 7. Authentication — How Login Works Under the Hood

*(To be filled in when we build auth)*

---

## 8. Middleware — The Bouncer at the Door

*(To be filled in when we write middleware.ts)*

---

## 9. Server vs Client Components

*(To be filled in as we build components)*

---

## 10. API Routes — Your Express Routes Inside Next.js

*(To be filled in when we build API routes)*

---

## 11. Claude API — Adding AI

*(To be filled in when we build the Decode assistant)*

---

## 12. Framer Motion — Animations

*(To be filled in in Phase 5)*

---

## 13. shadcn/ui — Component Library

*(To be filled in when we add components)*
