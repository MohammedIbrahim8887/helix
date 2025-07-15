import { generateText } from "ai";
import { openrouter } from "@/utils/configs/openrouter.config";

export const generateCaption = async (imageUrl: string) => {
  const result = await generateText({
    model: openrouter.chat("mistralai/mistral-small-3.2-24b-instruct:free"),
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
