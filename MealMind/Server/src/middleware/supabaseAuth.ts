import type { NextFunction, Request, Response } from "express";
import type { User } from "@supabase/supabase-js";

import { getSupabaseAuthClient } from "../lib/supabase-server.js";
import { HttpError } from "./errorHandler.js";

export type AuthedRequest = Request & { supabaseUser: User };

export async function requireSupabaseAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const raw = req.headers.authorization;
  const m = /^Bearer\s+(.+)$/.exec(raw ?? "");
  if (!m?.[1]) {
    throw new HttpError(401, "UNAUTHORIZED", "Missing Authorization bearer token.");
  }

  const supabase = getSupabaseAuthClient();
  const { data, error } = await supabase.auth.getUser(m[1]);
  if (error || !data.user) {
    throw new HttpError(401, "INVALID_TOKEN", "Invalid or expired token.");
  }

  (req as AuthedRequest).supabaseUser = data.user;
  next();
}
