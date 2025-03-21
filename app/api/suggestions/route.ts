import { NextResponse } from 'next/server';
import Groq from "groq-sdk";

const groq = new Groq();

// Common word completions for quick lookups
const commonCompletions: { [key: string]: string[] } = {
  "what": ["happened", "time", "about", "should", "could", "would"],
  "how": ["to", "can", "does", "much", "many"],
  "where": ["is", "are", "should", "can"],
  "when": ["will", "should", "can", "is"],
  "why": ["does", "should", "would", "is"],
  "which": ["one", "way", "option", "method"],
  "is": ["there", "this", "that", "it"],
  "can": ["you", "we", "this", "that"],
  "will": ["this", "that", "it", "they"],
  "the": ["best", "most", "way", "difference", "process", "result"]
};

export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const inputWord = query?.trim().toLowerCase();

    if (!inputWord || inputWord.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    // First check common completions for fast response
    for (const [base, completions] of Object.entries(commonCompletions)) {
      if (base.startsWith(inputWord)) {
        const suggestions = completions.map(completion => completion);
        return NextResponse.json({ suggestions: suggestions.slice(0, 3) });
      }
    }

    // If no common completion found, use AI
    const completion = await groq.chat.completions.create({
      model: "gemma2-9b-it",
      messages: [
        {
          role: "system",
          content: `You are an intelligent word completion engine. Given a partial word or phrase, suggest ONLY logical, appropriate completions.

Rules:
1. NEVER include the input word in output
2. NEVER use full sentences or explanations
3. ONLY return word completions
4. Keep completions short (1-3 words max)
5. NO greetings, acknowledgments, or meta-responses
6. NO inappropriate or offensive content
7. NO punctuation or special characters
8. Suggestions must be contextually relevant

Examples:
Input: "prog" → Output: "ramming"
Input: "artif" → Output: "icial"
Input: "what i" → Output: "s happening"
Input: "how t" → Output: "o implement"
Input: "the b" → Output: "est practice"`
        },
        {
          role: "user",
          content: inputWord
        }
      ],
      temperature: 0.1,
      max_tokens: 5,
      stop: [".", "?"] // Reduced to 2 stop sequences
    });

    let suggestion = completion.choices[0]?.message?.content?.trim() || '';
    
    // Clean and validate the suggestion
    suggestion = suggestion
      .replace(/^["'\s]+|["'\s]+$/g, '')
      .replace(/^[,.\s!?]+|[,.\s!?]+$/g, '')
      .replace(/^(okay|understanding|got it|i see|alright|sure)/i, '')
      .trim();

    // Additional validation to ensure quality
    if (
      suggestion.toLowerCase().includes(inputWord.toLowerCase()) ||
      suggestion.includes("I understand") ||
      suggestion.includes("Here's") ||
      suggestion.includes("Let me") ||
      suggestion.length > 20 ||
      suggestion.split(' ').length > 3
    ) {
      return NextResponse.json({ suggestions: [] });
    }

    return NextResponse.json({
      suggestions: suggestion ? [suggestion] : []
    });

  } catch (error) {
    console.error('Suggestion generation error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}