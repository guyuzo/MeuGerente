import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Express 4 não captura rejeição de handler async sozinho — este wrapper evita repetir try/catch em toda rota. */
export function asyncHandler(fn: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return (req, res, next: NextFunction) => {
    fn(req, res).catch(next);
  };
}
