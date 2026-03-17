export type TransactionType = "IN" | "OUT";

export type User = {
  id: number;
  email: string;
  username: string;
  birthdate: string | null;
};

export type AuthTokens = {
  access: string;
  refresh: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  birthdate?: string;
};

export type Category = {
  id: number;
  name: string;
  type: TransactionType;
  icon: string | null;
  is_personal: boolean;
};

export type CategoryPayload = {
  name: string;
  type: TransactionType;
  icon?: string;
};

export type Transaction = {
  id: number;
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  category: number | null;
  category_name: string | null;
  category_icon: string | null;
  created_at: string;
};

export type TransactionPayload = {
  description: string;
  amount: string;
  type: TransactionType;
  date: string;
  category?: number | null;
};

export type AnalysisResponse = {
  analysis: string;
};
