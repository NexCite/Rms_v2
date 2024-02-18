import { $Enums } from "@prisma/client";
import { z } from "zod";
const VoucherItemInputSchema = z
  .object({
    amount: z.number(),
    currency_id: z.number(),
    groupBy: z.number().default(1),
    chart_of_account_id: z.string(),
    rate: z.number().optional().nullable(),
    debit_credit: z.nativeEnum($Enums.DebitCreditType, {
      errorMap: (issue, ctx) => {
        return { message: "Required" };
      },
    }),
  })
  .array()
  .min(2, {
    message: "Voucher items must contain at least 2 rows ",
  });
type VoucherItemInputSchema = z.infer<typeof VoucherItemInputSchema>;
const VocuherItemSchema = z.object({
  items: VoucherItemInputSchema,
});
type VocuherItemSchema = z.infer<typeof VocuherItemSchema>;

const VoucherInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  note: z.string().nullable().optional(),
  rate: z.number().nullable().optional(),
  to_date: z.date(),
  currency_id: z.number(),
});

type VoucherInputSchema = z.infer<typeof VoucherInputSchema>;
export { VocuherItemSchema, VoucherInputSchema, VoucherItemInputSchema };
