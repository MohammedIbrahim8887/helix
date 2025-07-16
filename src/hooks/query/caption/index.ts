import { ApiPaginatedResponse, ApiResponse } from "@/types/api/common";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { uploadFiles } from "@/utils/helpers/uploadthing";
import { AccountGenerations } from "@/generated/prisma";
import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";

export const useGetAllCaptionsQuery = (page = 1, limit = 12, search = "") => {
  return useQuery({
    queryKey: ["captions", page, limit, search],
    queryFn: async () => {
      const res = await axios.get<ApiPaginatedResponse<AccountGenerations>>(
        "/api/captions/get-all",
        { params: { page, limit, search } }
      );
      return res.data;
    },
  });
};

export const useGetCaptionByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ["caption", id],
    queryFn: async () => {
      const res = await axios.get<ApiResponse<AccountGenerations>>(
        "/api/captions/get-by-id",
        {
          params: { id },
        }
      );
      return res.data;
    },
    enabled: !!id,
  });
};

export const useUpdateCaptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; caption: string }) => {
      const res = await axios.put<ApiResponse<AccountGenerations>>(
        "/api/captions/update",
        data
      );
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["caption", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
    },
  });
};

export const useDeleteCaptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await axios.delete<ApiResponse<null>>(
        "/api/captions/delete",
        { data: { id } }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captions"] });
    },
  });
};

export const useStreamingCaptionGenerator = (
  onCaptionGenerated?: (captionId: string) => void,
  tone: string = "social media"
) => {
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [shouldTriggerGeneration, setShouldTriggerGeneration] = useState(false);
  const [currentTone, setCurrentTone] = useState(tone);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      return uploadFiles("imageUploader", { files });
    },
    onSuccess: (uploadedFiles) => {
      if (uploadedFiles?.[0]?.key) {
        const key = uploadedFiles[0].key;
        setUploadedKey(key);
        setIsRegenerating(false);
        setShouldTriggerGeneration(true);
      }
    },
  });

  const {
    messages,
    append,
    isLoading: isGenerating,
    error,
  } = useChat({
    api: "/api/captions/generate",
    body: {
      key: uploadedKey,
      tone: currentTone,
    },
    onFinish: async () => {
      queryClient.invalidateQueries({ queryKey: ["captions"] });

      if (uploadedKey && onCaptionGenerated) {
        setTimeout(async () => {
          try {
            const response = await axios.get<
              ApiPaginatedResponse<AccountGenerations>
            >("/api/captions/get-all", { params: { page: 1, limit: 10 } });

            const latestCaption = response.data.data.find(
              (caption) => caption.key === uploadedKey
            );
            if (latestCaption) {
              onCaptionGenerated(latestCaption.id);
            }
          } catch (error) {
            console.error("Failed to fetch caption ID:", error);
          }
        }, 500);
      }
    },
  });

  const {
    messages: regenMessages,
    append: regenAppend,
    isLoading: isRegeneratingChat,
    error: regenError,
  } = useChat({
    api: "/api/captions/generate?type=regenerate",
    body: {
      key: uploadedKey,
      tone: currentTone,
    },
    onFinish: () => {
      queryClient.invalidateQueries({ queryKey: ["captions"] });
      queryClient.invalidateQueries({ queryKey: ["caption"] });
      setIsRegenerating(false);
    },
  });

  useEffect(() => {
    if (uploadedKey && shouldTriggerGeneration && !isRegenerating) {
      append({
        role: "user",
        content: `Generate caption for image with key: ${uploadedKey} using ${currentTone} tone`,
      });
      setShouldTriggerGeneration(false);
    }
  }, [
    uploadedKey,
    shouldTriggerGeneration,
    isRegenerating,
    append,
    currentTone,
  ]);

  // Update tone when it changes
  useEffect(() => {
    setCurrentTone(tone);
  }, [tone]);

  const uploadAndGenerate = (files: File[]) => {
    if (files.length === 0) return;
    setIsRegenerating(false);
    setCurrentTone(tone); // Set current tone before generation
    uploadMutation.mutate(files);
  };

  const regenerate = (key: string) => {
    setUploadedKey(key);
    setIsRegenerating(true);
    regenAppend({
      role: "user",
      content: `Regenerate caption for image with key: ${key} using ${currentTone} tone`,
    });
  };

  const currentCaption = isRegenerating
    ? regenMessages.filter((m) => m.role === "assistant").pop()?.content || ""
    : messages.filter((m) => m.role === "assistant").pop()?.content || "";

  const finalIsGenerating = isRegenerating ? isRegeneratingChat : isGenerating;
  const finalError = isRegenerating ? regenError : error;

  return {
    uploadAndGenerate,
    regenerate,
    currentCaption,
    isUploading: uploadMutation.isPending,
    isGenerating: finalIsGenerating,
    isLoading: uploadMutation.isPending || finalIsGenerating,
    error: uploadMutation.error || finalError,
    messages: isRegenerating ? regenMessages : messages,
    uploadedKey,
    isRegenerating,
  };
};
