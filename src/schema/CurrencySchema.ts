import { z } from "zod";

const CurrencyInputSchema = z.object({
  id: z.number().optional().nullable(),
  name: z.string(),
  symbol: z.string(),
  rate: z.number(),
});

type CurrencyInputSchema = z.infer<typeof CurrencyInputSchema>;
export { CurrencyInputSchema };
