# Artist Similarity Recommender

Pick 3 artists and get recommended artists with a quick similarity reason.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## How it works

- Each artist has style tags (rage, melodic, dark, etc.)
- App combines tags from your 3 selected artists
- Candidates are scored by shared tags
- Top matches are ranked and shown with "why"
