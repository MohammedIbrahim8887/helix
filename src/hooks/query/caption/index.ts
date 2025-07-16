import { AccountGenerations } from "@/types/api/caption";
import { ApiPaginatedResponse } from "@/types/api/common";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useGetAllCaptionsQuery = (
  page = 1,
  limit = 12,
  search = ""
) => {
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
    queryKey: ["captions", id],
    queryFn: async () => {
      const res = await axios.get("/api/captions/get-by-id", {
        params: { id },
      });
      return res.data;
    },
    enabled: !!id,
  });
};
