import { Router } from "express";

import { asyncHandler } from "../middleware/asyncHandler.js";
import type { AuthedRequest } from "../middleware/supabaseAuth.js";
import { requireSupabaseAuth } from "../middleware/supabaseAuth.js";

const router = Router();

/** Returns the Supabase user for a valid `Authorization: Bearer <access_token>`. */
router.get(
  "/me",
  requireSupabaseAuth,
  asyncHandler(async (req, res) => {
    const user = (req as AuthedRequest).supabaseUser;
    res.status(200).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          userMetadata: user.user_metadata ?? {},
        },
      },
    });
  }),
);

export const authRouter = router;
