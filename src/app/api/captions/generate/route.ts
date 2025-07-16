import { NextRequest } from "next/server";
import { auth } from "@/utils/auth/auth";
import { prisma } from "@/utils/configs/prisma.config";
import { streamText } from "ai";
import { openrouter } from "@/utils/configs/openrouter.config";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    
    let key: string | null = null;
    
    if (body.messages && body.messages.length > 0) {
      const lastMessage = body.messages[body.messages.length - 1];
      
      if (lastMessage.data && lastMessage.data.key) {
        key = lastMessage.data.key;
      } 
      else if (lastMessage.content && typeof lastMessage.content === 'string') {
        const match = lastMessage.content.match(/key:\s*([a-zA-Z0-9]+)/);
        if (match) {
          key = match[1];
        }
      }
    }
    
    if (!key && body.key) {
      key = body.key;
    }

    const isRegenerate = request.nextUrl.searchParams.get("type") === "regenerate";

    if (!key) {
      return new Response("Image key is required", { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id },
    });

    if (!account) {
      return new Response("Account not found", { status: 404 });
    }

    const imageUrl = `https://utfs.io/f/${key}`;

    const result = streamText({
      model: openrouter.chat("openai/gpt-4.1-nano"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Generate a descriptive and engaging caption for this image. Make it social media ready with relevant hashtags.",
            },
            {
              type: "image",
              image: new URL(imageUrl),
            },
          ],
        },
      ],
      onFinish: async ({ text }) => {
        try {
          const existing = await prisma.accountGenerations.findFirst({
            where: { accountId: account.id, key },
          });

          if (isRegenerate && existing) {
            await prisma.accountGenerations.update({
              where: { id: existing.id },
              data: { caption: text, updatedAt: new Date() },
            });
            console.log("Updated existing caption for key:", key);
          } else {
            await prisma.accountGenerations.create({
              data: { accountId: account.id, key, caption: text },
            });
            console.log("Created new caption for key:", key);
          }
        } catch (error) {
          console.error("Failed to save caption:", error);
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Stream generation error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}