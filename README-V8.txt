Ayousha V8 Smart Chat
====================
Features: instant messages, delivered/read status, presence, typing indicator, replies, reactions, pinned messages, save to memories, images/videos/audio attachments, voice recording, dark chat mode, quick heart.

IMPORTANT:
- Replace all project files in GitHub, not only index.html.
- Firebase Realtime Database rules must permit authorized read/write to app/mails, app/chatPresence and app/chatTyping. Do NOT set public read/write rules for private chats. The existing ?for=me/her query parameter is not authentication and is not secure.
- Media upload uses Firebase Storage. Configure Storage bucket, billing if required, and secure Storage rules before trying attachments. Storage uploads may fail until these are configured.
- Delivery means the recipient's running app acknowledged a message; read means the chat view was open while the message was loaded. Not a guarantee a person actually read it.
- Web notification sounds while the app is closed depend on Android/Chrome/FCM permissions and OS policies.
- Test both roles on separate devices. A role query parameter alone is not adequate access control.
- No end-to-end encryption is implemented. Implement Firebase Authentication and secure access rules before sharing sensitive content.
