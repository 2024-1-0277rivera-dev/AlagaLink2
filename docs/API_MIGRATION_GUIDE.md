# API Migration Guide: Gemini to Grok AI

This document outlines the necessary steps to replace the existing Google Gemini implementation with Grok AI.

## 📍 Implementation Points
The AI logic is currently centralized in:
- `components/ChatWindow.tsx`: The primary interaction engine.

## 🔄 Replacement Strategy

### 1. Import Swap
**Current (Gemini):**
```ts
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

**Target (Grok/X.AI Example):**
```ts
// Using standard OpenAI-compatible SDK which Grok supports
import OpenAI from "openai";
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});
```

### 2. Method Transformation
**Current (Gemini):**
```ts
const response = await ai.models.generateContent({
  model: 'gemini-3-flash-preview',
  contents: userMsg,
  config: { systemInstruction: systemPrompt }
});
const text = response.text;
```

**Target (Grok):**
```ts
const completion = await grok.chat.completions.create({
  model: "grok-beta", // or the latest Grok model
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMsg }
  ],
});
const text = completion.choices[0].message.content;
```

### 🧠 Prompt Maintenance
The `systemPrompt` used in `ChatWindow.tsx` includes complex regex-based tagging (`[[Name|ID|Type]]`). **Do not change the prompt content**, as the frontend relies on these specific brackets to render navigation chips. Grok AI is highly compatible with these instruction sets.
