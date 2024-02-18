import { $Enums, Prisma } from "@prisma/client";
import { z } from "zod";
const CurrencySchema = z.object({
  id: z.number(),
  name: z.string(),
  symbol: z.string(),
  rate: z.number().nullable().optional(),
});

export const ChartOfAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  account_type: z.nativeEnum($Enums.AccountType).optional().nullable(),
  currency: CurrencySchema.optional().nullable(),
  first_name: z.string().optional().nullable(),
  chart_of_account_type: z
    .nativeEnum($Enums.ChartOfAccountType)
    .optional()
    .nullable(),
  debit_credit: z.nativeEnum($Enums.DebitCreditType).optional().nullable(),
  last_name: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
});
export type CurrencySchema = z.infer<typeof CurrencySchema>;
export type ChartOfAccountSchema = z.infer<typeof ChartOfAccountSchema>;
const JournalInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  note: z.string().nullable().optional(),
  rate: z.number().nullable().optional(),
  to_date: z.date(),
  media: z.any(),

  currency: CurrencySchema,
  voucher_items: z
    .object({
      amount: z.number(),
      rate_amount: z.number().optional().nullable(),
      currency: CurrencySchema.nullable().optional(),
      type: z.string().nullable().optional(),
      chart_of_account: ChartOfAccountSchema,
      rate: z.number().optional().nullable(),
      debit_credit: z.nativeEnum($Enums.DebitCreditType, {
        errorMap: (issue, ctx) => {
          return { message: "Required" };
        },
      }),
    })

    .array()
    .min(2, { message: "Voucher items must contain at least 2 rows " }),
});

type JournalInputSchema = z.infer<typeof JournalInputSchema>;
export { JournalInputSchema };

type JournalVouchers = Prisma.VoucherGetPayload<{
  include: {
    currency: true;
    user: true;
    voucher_items: {
      include: {
        reference_chart_of_account: {
          select: {
            name: true;
            id: true;
            account_type: true;
            first_name: true;
            last_name: true;
            currency: {
              select: {
                name: true;
                symbol: true;
                rate: true;
              };
            };
          };
        };
        chart_of_account: {
          select: {
            name: true;
            id: true;
            account_type: true;
            first_name: true;
            last_name: true;
            currency: {
              select: {
                name: true;
                symbol: true;
                rate: true;
              };
            };
          };
        };
        currency: true;
      };
    };
  };
}>;
const VoucherSearchSchema = z.object({
  chart_of_accounts: z.custom<Prisma.VoucherGetPayload<{}>>().array(),
  id: z.number().optional().nullable(),
  currencies: z
    .object({ id: z.number(), name: z.string(), symbol: z.string() })
    .array(),
  pageIndex: z.number().optional().nullable(),
  pageSize: z.number().optional().nullable(),
  from: z.date().optional().nullable(),
  to: z.date().optional().nullable(),
  include_reference: z.boolean().optional().nullable(),
});

type VoucherSearchSchema = z.infer<typeof VoucherSearchSchema>;
export { VoucherSearchSchema, type JournalVouchers };
