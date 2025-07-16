export type ApiResponse<T> = {
  data: T;
  message: string;
  status: "success" | "error";
};

export type ApiPaginatedResponse<T> = {
  data: T[];
  message: string;
  status: "success" | "error";
  page: number;
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};
