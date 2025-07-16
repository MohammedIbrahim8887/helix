import { generateText } from "ai";
import { openrouter } from "@/utils/configs/openrouter.config";

export const generateCaption = async (imageUrl: string) => {
  const result = await generateText({
    model: openrouter.chat("openai/gpt-4.1-nano"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Generate a descriptive and engaging caption for this image.",
          },
          {
            type: "image",
            image: new URL(imageUrl),
          },
        ],
      },
    ],
  });

  return result;
};
