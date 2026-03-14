declare global {
  namespace Express {
    interface Request {
      auth: {
        userId: string;
        sessionClaims?: {
          email?: string;
          [key: string]: any;
        };
      };
    }
  }
}

export {};
