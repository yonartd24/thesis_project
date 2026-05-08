# Week 1 Frontend Setup

This starter uses React, Vite, Supabase JS, and GSAP to build the Week 1 archive view.

## 1. Install dependencies

```bash
npm install
```

## 2. Add your Supabase keys

Copy `.env.example` to `.env` and paste:

```bash
VITE_SUPABASE_URL=https://zffatgrgqvzcveikikrr.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use the publishable key in the browser. Do not put the secret or service role key in the browser.

## 3. Deploy the Week 1 Edge Function

The browser app does not read `card_entries` directly. Your table is closed by RLS, so the frontend fetches through a secure Edge Function instead.

Function source:

- [`supabase/functions/week-one-cards/index.ts`](/Users/yona/Desktop/ESDIR/TERCER AÑO (erasmus Detroit)/2º cuatri/Design Theory/2 - Thesis/cards_web/supabase/functions/week-one-cards/index.ts)

Deploy it with the Supabase CLI:

```bash
supabase secrets set --project-ref zffatgrgqvzcveikikrr SUPABASE_URL=https://zffatgrgqvzcveikikrr.supabase.co SUPABASE_SECRET_KEY=your-secret-key
supabase functions deploy week-one-cards --project-ref zffatgrgqvzcveikikrr
```

Or paste the same function into the Supabase dashboard function editor if you prefer the UI workflow.

## 4. Start the app

```bash
npm run dev
```

## 5. Current Week 1 behavior

- calls the `week-one-cards` Edge Function
- sorts by `stage`, then `entry_id`
- renders the four score rails from `q1_score` through `q4_score`
- uses a placeholder doodle panel instead of Supabase Storage images

## 6. Why the doodle is still a placeholder

Your bucket is private and the scans are not uploaded yet. That is the correct setup for research data. When you are ready to show doodles later, do not make the bucket public just to speed things up. Use signed URLs or a small server-side proxy instead.
