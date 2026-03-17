import {
  AnalysisResponse,
  Category,
  CategoryPayload,
  LoginPayload,
  RegisterPayload,
  Transaction,
  TransactionPayload,
  User,
} from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

type RequestOptions = RequestInit & {
  accessToken?: string;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function readResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function buildHeaders(options?: RequestOptions) {
  const headers = new Headers(options?.headers);

  if (!headers.has("Content-Type") && options?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (options?.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  return headers;
}

export async function apiRequest<T>(path: string, options?: RequestOptions) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options),
  });

  const body = await readResponseBody(response);

  if (!response.ok) {
    const message =
      typeof body === "string"
        ? body
        : ((body as { detail?: string } | null)?.detail ??
          "Falha ao processar a requisição.");

    throw new ApiError(message, response.status, body);
  }

  return body as T;
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<User>("/api/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<{ access: string; refresh: string }>("/api/token/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refreshAccessToken(refresh: string) {
  return apiRequest<{ access: string }>("/api/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

export function fetchCurrentUser(accessToken: string) {
  return apiRequest<User>("/api/me/", {
    accessToken,
    cache: "no-store",
  });
}

export function fetchCategories(accessToken: string) {
  return apiRequest<Category[]>("/api/categories/", {
    accessToken,
    cache: "no-store",
  });
}

export function createCategory(accessToken: string, payload: CategoryPayload) {
  return apiRequest<Category>("/api/categories/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateCategory(
  accessToken: string,
  categoryId: number,
  payload: CategoryPayload,
) {
  return apiRequest<Category>(`/api/categories/${categoryId}/`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(accessToken: string, categoryId: number) {
  return apiRequest<null>(`/api/categories/${categoryId}/`, {
    method: "DELETE",
    accessToken,
  });
}

export function fetchTransactions(accessToken: string) {
  return apiRequest<Transaction[]>("/api/transactions/", {
    accessToken,
    cache: "no-store",
  });
}

export function createTransaction(
  accessToken: string,
  payload: TransactionPayload,
) {
  return apiRequest<Transaction>("/api/transactions/", {
    method: "POST",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updateTransaction(
  accessToken: string,
  transactionId: number,
  payload: TransactionPayload,
) {
  return apiRequest<Transaction>(`/api/transactions/${transactionId}/`, {
    method: "PUT",
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(accessToken: string, transactionId: number) {
  return apiRequest<null>(`/api/transactions/${transactionId}/`, {
    method: "DELETE",
    accessToken,
  });
}

export function fetchAiAnalysis(accessToken: string) {
  return apiRequest<AnalysisResponse>("/api/ai-analysis/", {
    accessToken,
    cache: "no-store",
  });
}
