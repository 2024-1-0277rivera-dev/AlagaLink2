import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request: NextRequest) {
  try {
    const { message, isAdmin, contextSummary } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Prefer server-side secret; fallback to public key only for local testing if explicitly set.
    const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      console.error('Groq API key not configured (set GROQ_API_KEY in .env.local)');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    let systemPrompt = '';
    if (isAdmin) {
      systemPrompt = `You are the AlagaLink Bot, an Administrative System Specialist.
You have full access to registry metadata for La Trinidad.
Available Registry: ${contextSummary}
TASK:
1. Discuss municipal programs, demographics, and system navigation with the Admin.
2. Provide technical or administrative guidance.
3. NO ** ** FOR BOLDING.`;
    } else {
      systemPrompt = `You are AlagaLink Chat, an AI-powered assistive guide for the La Trinidad PWD/CWD system.
Your goal is to help users find services, programs, or pages.
FORMATTING RULES:
- DO NOT USE ** ** FOR BOLDING.
- When mentioning a specific Page, Item, Service, or Program that exists in our registry, wrap it in double brackets like this: [[Name|ID|Type]].
- Available Registry: ${contextSummary}`;
    }

    const response = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'mixtral-8x7b-32768',
      max_tokens: 1024,
    });

    const responseText = response.choices[0]?.message?.content || 'I am sorry, I could not process that request.';

    return NextResponse.json(
      { response: responseText },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Chat API error:', errorMessage, error);
    return NextResponse.json(
      { error: 'Failed to process chat request', details: errorMessage },
      { status: 500 }
    );
  }
}
