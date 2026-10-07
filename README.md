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
| Portfolio tiles, plans, nav links, fixed card slots | `content/site.ts` |
| What the chat box knows | `content/knowledge-base.md` |
| Masonry layout logic | `lib/masonry.ts` |
| ChatGPT endpoint | `app/api/chat/route.ts` |
| Stripe checkout (stub) | `app/api/checkout/route.ts` |
| How it works / FAQs / Pricing / Intro call | `app/*/page.tsx` (blank for now) |

**Adding work:** drop an image in `public/work/` and add an entry to `work` in
`content/site.ts`. Tiles fill into the shortest column, in order.

**Fixed cards:** each entry in `fixedCards` has a slot (column + row) for every
column count (4 on desktop down to 1 on mobile). Work never takes those slots.
The pricing card is pinned to the top of the right-most column.
