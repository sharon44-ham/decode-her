export type Experience = "LEARNING" | "SAFE_SPACE";

export type PostCategory =
  | "TEXTING" | "FIRST_DATES" | "CONFLICT" | "COMMUNICATION"
  | "BOUNDARIES" | "LOVE_LANGUAGES" | "RED_FLAGS" | "UNDERSTANDING" | "GENERAL";

export type PostType = "RANT" | "TUTORIAL" | "STORY" | "LESSON";

export type ReactionType = "HEART" | "FELT_THIS" | "NEEDED_THIS" | "HUG";

export type ModStatus = "PENDING" | "APPROVED" | "FLAGGED" | "REJECTED";

export interface User {
  id: string;
  email: string;
  username: string;
  genderIdentity?: string;
  experience: Experience;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  datingCard?: DatingCard;
}

// The "How to Date Me" card — deep long-form answers, filled during onboarding
export interface DatingCard {
  id: string;
  userId: string;
  shareToken: string;
  isPublic: boolean;
  onSupport?: string;
  onBeingUnderstood?: string;
  onDepth?: string;
  onConflict?: string;
  onPatterns?: string;
  onSafety?: string;
  onLoveLanguage?: string;
  onFalling?: string;
  dealbreakers: string[];
  greenFlags: string[];
  funFact?: string;
  user?: Pick<User, "username" | "avatarUrl">;
}

// The CARD QUESTIONS — shown during onboarding and on the card editor
export const CARD_QUESTIONS: { field: keyof DatingCard; question: string; tag: string; placeholder: string }[] = [
  {
    field: "onSupport",
    tag: "On support",
    question: "When you're going through something hard, what does support from a partner actually look like for you? Not in theory — what have you actually needed?",
    placeholder: "Take your time with this one. There's no wrong answer.",
  },
  {
    field: "onBeingUnderstood",
    tag: "On being understood",
    question: "Think about a moment you felt completely misunderstood by someone you were dating. What did they miss? What did you wish they'd done instead?",
    placeholder: "It's okay if this brings something up.",
  },
  {
    field: "onDepth",
    tag: "On your depth",
    question: "What's something about you that takes time to understand — but once someone gets it, everything just clicks?",
    placeholder: "The thing people who really know you know.",
  },
  {
    field: "onConflict",
    tag: "On conflict",
    question: "Describe what a conflict handled right looks like between you and a partner. What would you need from them in that moment?",
    placeholder: "Think about a time it went well, or how you wish it had gone.",
  },
  {
    field: "onPatterns",
    tag: "On patterns",
    question: "There's probably something you've had to explain in every relationship. What is it? Why do you think people keep missing it?",
    placeholder: "That thing you always end up having to say.",
  },
  {
    field: "onSafety",
    tag: "On safety",
    question: "Describe the version of yourself that shows up when you feel truly safe with someone. What do they see?",
    placeholder: "Who are you when you can fully exhale?",
  },
  {
    field: "onLoveLanguage",
    tag: "On love languages",
    question: "What does your love language actually look like day-to-day with you — not the word, the real thing?",
    placeholder: "Skip the label. What does it actually mean in your life?",
  },
  {
    field: "onFalling",
    tag: "On falling for someone",
    question: "How do you know when you're falling for someone? What changes in you — how you act, what you notice, how you feel?",
    placeholder: "The subtle signs you notice in yourself.",
  },
];

// Posts written by SAFE_SPACE users — content engine for LEARNING track
export interface Post {
  id: string;
  userId: string;
  title?: string;
  content: string;
  category: PostCategory;
  type: PostType;
  isAnonymous: boolean;
  published: boolean;
  createdAt: Date;
  user?: Pick<User, "username" | "avatarUrl">;
  reactions?: ReactionCounts;
  _count?: { reactions: number };
}

export interface ReactionCounts {
  HEART: number;
  FELT_THIS: number;
  NEEDED_THIS: number;
  HUG: number;
}

export interface Rant {
  id: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
  reactions?: ReactionCounts;
}

export interface EmpathyDrill {
  id: string;
  scenario: string;
  context: string;
  options: DrillOption[];
  bestOption: string;
  category: PostCategory;
  explanation: string;
}

export interface DrillOption {
  id: string;
  text: string;
  feedback: string;
}
