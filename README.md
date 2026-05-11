# decode**her**                                                                                                             
                                                                                                                              
  > Not swiping on photos. Resonating with how someone actually wants to be loved.
                                                                                                                              
  decode her is a full-stack connection app built around emotional honesty. Instead of matching on looks, people fill out a 
  *How to Date Me* card — personal questions about how they receive support, feel safe, and what love looks like to them.
  Others read the card, and if something genuinely resonates, they send a message tied to that specific answer. The person on
  the other end decides whether to let them in.                                                                               
   
  ---                                                                                                                         
                                                                                                                            
  ## The two sides

  | Experience | Who | What they do |
  |---|---|---|
  | **Safe Space** | Women | Write rants, stories, and how-tos. Fill out their card. Receive and accept resonances. |
  | **Learning** | Men | Read those stories as lessons. Take drills to test understanding. Discover people through their cards. |             
  
                                          
  Both sides can browse cards, send resonances, and message each other once connected.
                                                                                                                              
  ---
                                                                                                                              
  ## Core features                                                                                                          

  - **How to Date Me card** — 8 personal questions. Your card is your profile. Without it you're invisible in discovery.
  - **Resonance system** — to connect with someone you quote a specific answer from their card and explain what stayed with
  you. Generic messages aren't possible by design.
  - **Acceptance → DM** — when a resonance is accepted, a private conversation opens automatically. One conversation per pair,
   always.                                    
  - **Real-time messaging** — 1:1 DMs with live message delivery, unread dot indicators, and conversations sorted by latest   
  message.                                                                                                                  
  - **Rant room / Lessons** — SAFE_SPACE users write posts (rants, stories, how-tos). LEARNING users read the same content as 
  lessons.                                    
  - **Drills** — scenario-based multiple choice questions with explanations. For the LEARNING side to practice understanding. 
  - **Discovery** — browse other people's cards. Already-connected users are filtered out automatically.                    
  - **Nav badges** — live unread dot on Messages, count badge on Resonances.                                                  
                                          
  ---                                                                                                                         
                                                                                                                              
  ## Tech stack
                                                                                                                              
  | | |                                                                                                                     
  |---|---|
  | **Framework** | Next.js 14 — App Router, Server Components |
  | **Language** | TypeScript throughout |    
  | **Database** | PostgreSQL via Supabase |
  | **Auth** | Supabase Auth (email + magic link) |
  | **Realtime** | Supabase Realtime (`postgres_changes`) for live chat |                                                     
  | **Styling** | Tailwind CSS with custom design tokens |
  | **Deployment** | Vercel |                                                                                                 
                                                                                                                            
  ---                                                                                                                         
   
## Architecture                             
                                              
  \```                                    
  src/                                                                                                                        
  ├── app/                                                                                                                    
  │   ├── auth/                  # Login, signup, email verify, OAuth callback                                                
  │   ├── dashboard/             # Root layout (nav, badges) + home page                                                      
  │   ├── card/                  # How to Date Me card editor                                                               
  │   ├── profile/                        
  │   │   ├── [username]/        # Public profile + resonance modal
  │   │   └── edit/              # Profile settings                                                                           
  │   ├── resonances/            # Resonance inbox — accept or pass
  │   ├── messages/                                                                                                           
  │   │   ├── page.tsx           # Conversation list, sorted by latest message                                              
  │   │   └── [conversationId]/  # Real-time chat view                                                                        
  │   ├── rant-room/             # Post feed — write (SAFE_SPACE) or read (everyone)
  │   ├── lessons/               # Same feed, read-only for LEARNING users                                                    
  │   └── drills/                # Scenario quiz for LEARNING users                                                         
  ├── components/shared/         # Shared UI components                                                                       
  ├── lib/supabase/              # Client + server Supabase helpers
  └── types/                     # Shared TypeScript types, CARD_QUESTIONS                                                    
  \```                                                      
                                          
  ### Key design decisions                                                                                                    
                                                                                                                              
  **Server components for data, client components for interaction** — pages and layouts fetch data on the server. Only
  interactive pieces (chat, resonance modal, drills) are client components.                                                   
                                                                                                                            
  **Layout-level auth + badges** — `dashboard/layout.tsx` runs on every navigation via `force-dynamic`. It fetches auth, nav  
  badge counts, and unread state in one place.
                                                                                                                              
  **Resonance → Conversation as a one-way door** — accepting a resonance creates exactly one Conversation row between two     
  users. Subsequent resonances between the same pair reuse the existing conversation. The profile page checks for an existing
  conversation and shows a "Message" button instead of "This resonated" if one already exists.                                
                                                                                                                              
  **Read tracking without a separate table** — `user1LastReadAt` and `user2LastReadAt` columns on the Conversation table.
  Updated server-side when the chat page loads so the nav dot clears before the user can navigate away.                       
                                                                                                                            
  **Optimistic UI for messages** — messages appear instantly with a client-generated UUID, then get confirmed (or rolled back)
   when the Supabase insert resolves.
                                                                                                                              
  ---                                                                                                                       

 ## Database schema (9 tables)                                                                                               
   
  | Table | Key columns |                                                                                                     
  |---|---|                                                                                                                 
  | `User` | id, username, email, experience, genderIdentity, avatarUrl, bio |
  | `DatingCard` | userId, onSupport, onSafety, onFalling, onConflict, onLove, onAnxiety, onGrowth, isPublic |                
  | `Resonance` | id, fromUserId, toUserId, cardQuoteField, cardQuoteText, message, status |
  | `Conversation` | id, resonanceId, user1Id, user2Id, user1LastReadAt, user2LastReadAt |                                    
  | `Message` | id, conversationId, senderId, content, createdAt |                                                          
  | `Post` | id, authorId, title, content, type, category, isAnonymous, isPublished |                                         
  | `Reaction` | id, postId, userId, type |   
  | `Drill` | id, scenario, options (JSON), correctIndex, explanation, category |                                             
  | `DrillAttempt` | id, drillId, userId, selectedIndex, isCorrect |
