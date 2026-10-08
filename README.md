# Designjoy

Next.js site for designjoy.co: a masonry grid of work with fixed cards pinned in place.

```bash
npm install
cp .env.example .env.local   # add OPENAI_API_KEY for the chat box
npm run dev
```

## Where things live

| What | File |
| --- | --- |
| Upload, reorder, rename, remove projects | `/admin` (password: `ADMIN_PASSWORD`) |
| Sample tiles, plans, nav links, fixed card slots | `content/site.ts` |
| What the chat box knows | `/admin/knowledge` (starts from `content/knowledge-base.md`) |
| Masonry layout logic | `lib/masonry.ts` |
| ChatGPT endpoint | `app/api/chat/route.ts` |
| Stripe checkout (embedded) and welcome page | `app/api/checkout/route.ts`, `app/(site)/checkout`, `app/(site)/welcome` — keys in `.env.example` |
| FAQs / Pricing / Book a call pages | `app/(site)/*/page.tsx` |

**Adding work:** sign in at `/admin` and drag in PNG, JPG, GIF, or MP4 files
(up to 500 MB each). Files are stored in Vercel Blob and appear on the
homepage straight away, newest first; use the arrows to reorder. Until the
first upload, the homepage shows the sample work in `content/site.ts`.

The portal needs two environment variables: `ADMIN_PASSWORD` (anything you
choose) and `BLOB_READ_WRITE_TOKEN` (create a Blob store in your Vercel
project under Storage; Vercel adds the token for you).

**Fixed cards:** each entry in `fixedCards` has a slot (column + row) for every
column count (4 on desktop down to 1 on mobile). Work never takes those slots.
The pricing card is pinned to the top of the right-most column.

**Chatbot knowledge:** edit it in the Chatbot tab at `/admin/knowledge`. Saves
go to Vercel Blob and the chatbot picks them up within a minute, with no
redeploy. Until the first save, it uses `content/knowledge-base.md`.
