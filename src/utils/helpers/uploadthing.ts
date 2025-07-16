import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { genUploader } from "uploadthing/client";

import type { FileRouter } from "@/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<FileRouter>();
export const UploadDropzone = generateUploadDropzone<FileRouter>();

export const { uploadFiles } = genUploader<FileRouter>();
