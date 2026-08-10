# Khatri AI Admin

The protected Next.js administration panel for Khatri AI Assistant.

## Configuration

Create `.env.local`:

```dotenv
ADMIN_PASSWORD=your-admin-login-password
ADMIN_SESSION_SECRET=a-random-secret-with-at-least-32-characters
ADMIN_API_SECRET=a-separate-random-shared-backend-secret
KHATRI_AI_API_URL=http://localhost:3000
```

`ADMIN_API_SECRET` must have the same value in the chatbot backend. It is used only for server-to-server admin API calls and is never exposed to the browser.

Generate either secret with `openssl rand -base64 32`.

## Development

Start the chatbot backend first, then run the admin panel on a different port:

```bash
npm run dev -- -p 3001
```

The greeting and menu management pages support creating, editing, deleting, ordering, enabling, and disabling MongoDB-backed chatbot content. The knowledge page uploads supported documents through the existing chatbot extraction and Qdrant indexing pipeline and displays live indexing status and errors. The settings page manages public chatbot branding and welcome content.
# khatri_ai_admin
