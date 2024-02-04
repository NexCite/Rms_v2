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
const JournalVoucherInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  note: z.string().nullable().optional(),
  rate: z.number().nullable().optional(),
  to_date: z.date(),
  media: z.any(),
  config_id: z.number().nullable().optional(),
  currency: CurrencySchema,
  voucher_items: z
    .object({
      amount: z.number(),
      rate_amount: z.number().optional().nullable(),
      currency: CurrencySchema.nullable().optional(),
      type: z.string().nullable().optional(),
      chart_of_account: ChartOfAccountSchema,
      reference_chart_of_account: ChartOfAccountSchema.optional().nullable(),
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
// .refine(
//   (values) => {
//     var total = 0;
//     values.voucher_items.map((res) => {
//       res.chart_of_account.currency =
//         res.chart_of_account?.currency ?? values.currency;
//       if (res.reference_chart_of_account) {
//         res.reference_chart_of_account.currency =
//           res.reference_chart_of_account?.currency ?? values.currency;
//       }

//       switch (res.debit_credit) {
//         case "Credit":
//           // if (res.reference_chart_of_account) {
//           //   if (res.reference_chart_of_account?.currency?.rate) {
//           //     total -=
//           //       res.amount / res.reference_chart_of_account.currency.rate;
//           //   } else {
//           //     total -= res.amount;
//           //   }
//           // } else {
//           if (res.chart_of_account?.currency?.rate) {
//             total -= res.amount / res.chart_of_account.currency.rate;
//           } else {
//             total -= res.amount;
//           }
//           // }

//           break;
//         case "Debit":
//           // if (res.reference_chart_of_account) {
//           //   if (res.reference_chart_of_account?.currency?.rate) {
//           //     total +=
//           //       res.amount / res.reference_chart_of_account.currency.rate;
//           //   } else {
//           //     total += res.amount;
//           //   }
//           // } else {
//           if (res.chart_of_account?.currency?.rate) {
//             total += res.amount / res.chart_of_account.currency.rate;
//           } else {
//             total += res.amount;
//           }

//           break;

//         case "Debit_Credit":
//           break;
//       }

//       return res;
//     });
//     return total === 0;
//   },
//   {
//     message: "Total of voucher must be equal to 0",
//     path: ["voucher_items"],
//   }
// );

type JournalVoucherInputSchema = z.infer<typeof JournalVoucherInputSchema>;
export { JournalVoucherInputSchema };

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
