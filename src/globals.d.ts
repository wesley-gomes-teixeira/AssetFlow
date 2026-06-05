declare module "express" {
  interface Request {
    user?: {
      id: number;
      name: string;
      email: string;
      role: "admin" | "analyst" | "user";
    };
  }
}

declare namespace Express {
  interface Request {
    user?: {
      id: number;
      name: string;
      email: string;
      role: "admin" | "analyst" | "user";
    };
  }
}
