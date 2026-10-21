Ayousha V9 — Interactive experiences

- Chat composer is now TEXT ONLY. The microphone, image/file picker buttons were removed from the chat.
- Daily questions: independent per-person responses, reveal after both answer, random prompts, quiz and archive.
- Memories: search, book, slideshow, on-this-day, saved chat messages.
- Surprises: gift cards, word-reveal puzzle, lucky prompts, future messages, occasions.
- Moods: separate daily mood per person, support/rose notifications, history and soft ambient tone.
- Shared dashboard and badges.

Deployment: replace ALL files in the GitHub repository, then redeploy Vercel. Keep a backup of the previous version.
Firebase Realtime Database paths added: app/dailyResponses, app/dailyPrompts, app/v9Moods, app/v9Occasions.
Security: authenticate both users and enforce server-side Firebase rules before storing private content. URL role flags alone are NOT authentication.
Note: "movie" is an in-app slideshow, not exported MP4. "map" is a place list for memories with a place field, not a map service. The quiz is a shared guessing prompt, not automatic grading. Android background notification sounds depend on OS/browser configuration.
No real-device/Firebase end-to-end test has been performed.
