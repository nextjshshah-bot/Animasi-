# MotionGen

A local-first AI motion graphics pipeline built with Next.js, React, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Describe a concept, generate a system prompt, paste the HTML response from your LLM, then run and export the motion.

## Notes

Preview code is isolated in a sandboxed iframe. Export uses the browser's Canvas MediaRecorder pipeline. Browsers that support H.264 produce MP4; browsers without MP4 MediaRecorder support download WebM instead.
