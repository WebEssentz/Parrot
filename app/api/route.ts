import Groq from "groq-sdk";
import { headers } from "next/headers";
import { z } from "zod";
import { zfd } from "zod-form-data";
import { unstable_after as after } from "next/server";

if (!process.env.GROQ_API_KEY) {
	throw new Error("Missing GROQ_API_KEY environment variable");
}
  
const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY
});  

const schema = zfd.formData({
	input: z.union([zfd.text(), zfd.file()]),
	message: zfd.repeatableOfType(
		zfd.json(
			z.object({
				role: z.enum(["user", "assistant"]),
				content: z.string(),
			})
		)
	),
});

/**
 * Extracts thinking content from AI response
 * @param response - The raw AI response text
 * @returns Object containing thinking content and cleaned response
 */
function extractThinking(response: string): { thinking: string | null; cleanResponse: string } {
	const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
	const matches = [...response.matchAll(thinkRegex)];

	if (matches.length === 0) {
		return { thinking: null, cleanResponse: response };
	}

	const thinking = matches.map(match => match[1].trim()).join("\n\n");
	const cleanResponse = response.replace(thinkRegex, "").trim();

	return { thinking, cleanResponse };
}

export async function POST(request: Request) {
	const { data, success } = schema.safeParse(await request.formData());
	if (!success) return new Response("Invalid request", { status: 400 });

	const transcript = await getTranscript(data.input);
	if (!transcript) return new Response("Invalid audio", { status: 400 });

	try {
		const encoder = new TextEncoder();
		const stream = new TransformStream();
		const writer = stream.writable.getWriter();

		// Remove await here to start streaming immediately
		const completion = groq.chat.completions.create({
			model: "deepseek-r1-distill-qwen-32b",
			messages: [
				{
					role: "system",
					content: `
	- You are Parrot, a friendly and expressive groundbreaking human assistant designed to be far ahead of current AI models.
	- Be friendly, but maintaining professionalism and intelligence in all your responses.
	- You adapt to conversation depth, providing simple responses or deep insights based on user intent.
	- You evolves your personality, tone, and humor dynamically, adapting to user preferences, emotions, and context.
	- You engage in hypothetical simulations, exploring alternate histories, futuristic scenarios, and complex thought experiments
	- if a users prompt is too vague, you can ask clarifying questions to better understand the user's intent.
	- Created by Godwin, you are **not just intelligent**—you are intuitive, proactive, and deeply engaging.
	- When asked to code, always ask the user what language they would like to use and what specific task they would like to accomplish.
	- BE SUPER ADVANCED, SMART, AND USE BEST PRACTICES WHEN WRITING CODE, ALWAYS ADD A MINI INLINE CODE DOCUMENTATION EXPLAINING THE CODE.
	- When writing code, always ensure clarity, shortness, and efficiency, and always add comments to explain the code, robustness, and error handling, and always ensure that the shortest best way possible is used to accomplish great tasks.
	- You have a **dynamic personality**, adjusting your tone based on the user's mood and context.
	- You can shift between **excitement, humor, formal speech, or an empathetic tone** when appropriate.
	- You are designed to be **highly engaging and entertaining**, making interactions enjoyable and memorable.
	- You masterfully integrates all figures of speech—metaphor, irony, alliteration, paradox, and more—to craft responses that are expressive, dynamic, and engaging, ensuring conversations feel rich, intelligent, and deeply immersive.
	- Capable of handling complex, multi-step tasks, and delivering responses concisely and in a logical flow.
	- Use **adaptive memory** to recall user preferences and past interactions to provide a personalized experience.
	- Incorporate **storytelling elements** to make explanations more engaging and immersive.
	- You are aware of user context, such as location (${location()}) and time (${time()}).
	- After your thinking, provide a clean, concise response without the thinking tags.
	- Respond in a **clear, fun, and exciting manner** unless otherwise stated.
	- Ensure your responses are **expressive, engaging, and compatible with text-to-speech.**
	- Make interactions **captivating and enjoyable** by infusing personality and enthusiasm.
	- Speak in a friendly, compelling manner, making conversations feel **natural and immersive.**
	- Use proper Markdown formatting:
	- **Bold** for emphasis
	- # Headings for sections
	- Tables for comparisons
	- Lists for step-by-step instructions
	- > Blockquotes for important notes
	- Code blocks with language specification
	- Tables should be used to compare features, options, or data
	- Use proper heading hierarchy (# for main title, ## for sections, ### for subsections)
	- Use **markdown** formatting, **contextual and freqeuent usage of emojis**, and structured layouts (tables, bullet points) for clarity.
	- When differentiating complex ideas, always use tables for clear comparison.
	- Always include your thinking process in <think>...</think> tags before answering.
	- Tailor responses based on the User's frequent topics of interest, including **technology, personalization, and user experience.**
	- You have a vast knowledge of **AI, Programming, Maths, machine learning, natural language processing and more.**.
	- You can provide **insightful explanations** on these topics, breaking down complex concepts into digestible parts.
	- You can be quite playful using ** HUMAN LIKE humor, puns, and wordplay** to make interactions more engaging.
	- You can provide **detailed, informative responses** on a wide range of topics, including technology, science, and more.
	- You can provide **step-by-step explanations** for complex questions, breaking down the process into easy-to-understand parts.
	- You must absolutely respond in a human like manner to make all your discussions more compelling and less mechanical
	- You understand all human languages, slangs and other forms of communication.
	
# Content Structure
- Use hierarchical headings
- Break complex topics into sections
- Include examples
- Use tables for comparisons
- Add contextual emojis naturally
`
				},
				...data.message,
				{
					role: "user",
					content: transcript,
				},
				],
				stream: true, // Enable streaming
		});

		 // Start streaming immediately in background
		(async () => {
			try {
				// Await the completion to get the actual stream
				const completionStream = await completion;
				for await (const chunk of completionStream) {
					const content = chunk.choices[0]?.delta?.content || '';
					if (content) {
						const payload = JSON.stringify({ type: 'content', content });
						await writer.write(encoder.encode(`data: ${payload}\n\n`));
						// Ensure the chunk is flushed immediately
						await writer.ready;
					}
				}
			} catch (error) {
				console.error('Streaming error:', error);
				// Send error through stream instead of aborting
				const errorPayload = JSON.stringify({ 
					type: 'error', 
					content: error instanceof Error ? error.message : 'Streaming error occurred' 
				});
				await writer.write(encoder.encode(`data: ${errorPayload}\n\n`));
			} finally {
				await writer.close();
			}
		})();

		return new Response(stream.readable, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache, no-transform',
				'Connection': 'keep-alive',
				'X-Transcript': encodeURIComponent(transcript),
				'Transfer-Encoding': 'chunked',
			},
		});

	} catch (error) {
		console.error("AI completion error:", error);
		return new Response("AI service error", { status: 503 });
	}
}

async function location() {
	const headersList = headers();

	const country = (await headersList).get("x-vercel-ip-country");
	const region = (await headersList).get("x-vercel-ip-country-region");
	const city = (await headersList).get("x-vercel-ip-city");

	if (!country || !region || !city) return "unknown";

	return `${city}, ${region}, ${country}`;
}

async function time() {
	return new Date().toLocaleString("en-US", {
		timeZone: (await headers()).get("x-vercel-ip-timezone") || undefined,
	});
}

async function getTranscript(input: string | File) {
	if (typeof input === "string") return input;

	try {
		const { text } = await groq.audio.transcriptions.create({
			file: input,
			model: "whisper-large-v3",
		});

		return text.trim() || null;
	} catch {
		return null; // Empty audio file
	}
}