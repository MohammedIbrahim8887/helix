import { ApiPaginatedResponse, ApiResponse } from "@/types/api/common";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { uploadFiles } from "@/utils/helpers/uploadthing";
import { AccountGenerations } from "@/generated/prisma";

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
      const res = await axios.get<ApiResponse<AccountGenerations>>("/api/captions/get-by-id", {
        params: { id },
      });
      return res.data;
    },
    enabled: !!id,
  });
};

const generateCaptionApi = async (
  key: string
): Promise<ApiResponse<AccountGenerations>> => {
  const { data } = await axios.post("/api/captions/generate", { key });
  return data;
};

const uploadFilesApi = async (files: File[]) => {
  return uploadFiles("imageUploader", { files });
};

export const useCaptionGeneratorMutation = () => {
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

  const uploadAndGenerate = (files: File[], options?: { onSuccess?: () => void; onError?: (error: any) => void }) => {
    if (files.length === 0) return;
    uploadMutation.mutate(files, {
      onSuccess: () => {
        if (options?.onSuccess) options.onSuccess();
      },
      onError: (error) => {
        if (options?.onError) options.onError(error);
      },
    });
  };

  const reset = () => {
    uploadMutation.reset();
    generateCaptionMutation.reset();
  };

  return {
    uploadAndGenerate,
    isUploading: uploadMutation.isPending,
    isGenerating: generateCaptionMutation.isPending,
    generation: generateCaptionMutation.data?.data,
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

export const useUpdateCaptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; caption: string }) => {
      const res = await axios.put<ApiResponse<AccountGenerations>>("/api/captions/update", data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["caption", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["captions"] });
    },
  });
};

export const useRegenerateCaptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const res = await axios.post<ApiResponse<AccountGenerations>>("/api/captions/generate?type=regenerate", { key });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["captions"] });
    },
  });
};
