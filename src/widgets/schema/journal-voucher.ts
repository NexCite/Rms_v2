import { $Enums, Prisma } from "@prisma/client";
import { ZodString, ZodType, z } from "zod";
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
      reffrence_chart_of_account: ChartOfAccountSchema.optional().nullable(),
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
//       if (res.reffrence_chart_of_account) {
//         res.reffrence_chart_of_account.currency =
//           res.reffrence_chart_of_account?.currency ?? values.currency;
//       }

//       switch (res.debit_credit) {
//         case "Credit":
//           // if (res.reffrence_chart_of_account) {
//           //   if (res.reffrence_chart_of_account?.currency?.rate) {
//           //     total -=
//           //       res.amount / res.reffrence_chart_of_account.currency.rate;
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
//           // if (res.reffrence_chart_of_account) {
//           //   if (res.reffrence_chart_of_account?.currency?.rate) {
//           //     total +=
//           //       res.amount / res.reffrence_chart_of_account.currency.rate;
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

    voucher_items: {
      include: {
        reference_chart_of_account: {
          select: {
            name: true;
            id: true;
            account_type: true;
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
  include_reffrence: z.boolean().optional().nullable(),
});

type VoucherSearchSchema = z.infer<typeof VoucherSearchSchema>;
export { type JournalVouchers, VoucherSearchSchema };
