import { useMutation } from "@tanstack/react-query";
import { uploadFiles } from "@/utils/helpers/uploadthing";

interface GenerateCaptionResponse {
  success: boolean;
  caption: string;
  generationId: string;
}

const generateCaptionApi = async (
  key: string,
): Promise<GenerateCaptionResponse> => {
  const response = await fetch("/api/generate-caption", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate caption");
  }

  return response.json();
};

const uploadFilesApi = async (files: File[]) => {
  return uploadFiles("imageUploader", { files });
};

export const useCaptionGenerator = () => {
  const uploadMutation = useMutation({
    mutationFn: uploadFilesApi,
    onSuccess: (uploadedFiles) => {
      if (uploadedFiles?.[0]?.key) {
        generateCaptionMutation.mutate(uploadedFiles[0].key);
      }
    },
  });

  const generateCaptionMutation = useMutation({
    mutationFn: generateCaptionApi,
  });

  const uploadAndGenerate = (files: File[]) => {
    if (files.length === 0) return;
    uploadMutation.mutate(files);
  };

  const reset = () => {
    uploadMutation.reset();
    generateCaptionMutation.reset();
  };

  return {
    uploadAndGenerate,
    isUploading: uploadMutation.isPending,
    isGenerating: generateCaptionMutation.isPending,
    caption: generateCaptionMutation.data?.caption || "",
    error:
      uploadMutation.error?.message ||
      generateCaptionMutation.error?.message ||
      null,
    isLoading: uploadMutation.isPending || generateCaptionMutation.isPending,
    isSuccess: generateCaptionMutation.isSuccess,
    isError: uploadMutation.isError || generateCaptionMutation.isError,
    reset,
    uploadMutation,
    generateCaptionMutation,
  };
};
