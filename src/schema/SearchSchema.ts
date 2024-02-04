import { z } from "zod";

export const Search = z.object({
  from: z.date(),
  to: z.date(),
});

export type Search = z.infer<typeof Search>;
