export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export type UserRole = "admin" | "analyst" | "user";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserInput {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  status: string;
  userId?: number | null;
}

export interface AssetPayload {
  name: string;
  type: string;
  status: string;
  userId?: number | null;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  assetId?: number | null;
}

export interface TicketPayload {
  title: string;
  description: string;
  status: string;
  assetId?: number | null;
}

export interface ServiceError extends Error {
  status?: number;
}

export interface RequestLike {
  headers: any;
  body: any;
  params: any;
  query: any;
  method: string;
  user?: AuthenticatedUser;
}

export interface ResponseLike {
  status: (code: number) => ResponseLike;
  json: (data: any) => ResponseLike;
  header: (key: string, value: string) => ResponseLike;
  sendStatus: (code: number) => ResponseLike;
}

export type NextFunction = (err?: any) => void;
