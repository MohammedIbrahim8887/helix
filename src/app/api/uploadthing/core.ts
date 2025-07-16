import {
  createUploadthing,
  type FileRouter as FileRouterType,
} from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/utils/auth/auth";

const f = createUploadthing();

export const fileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession(req);

      if (!session?.user) throw new UploadThingError("Unauthorized");

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.ufsUrl);
      console.log("file key", file.key);

      return {
        uploadedBy: metadata.userId,
        key: file.key,
        url: file.ufsUrl,
      };
    }),
} satisfies FileRouterType;

export type FileRouter = typeof fileRouter;
