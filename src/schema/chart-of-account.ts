import { $Enums } from "@prisma/client";
import { z } from "zod";

const ChartOfAccountInputSchema = z.object({
  name: z.string().min(1, { message: "Name must be not empty!" }),
  id: z
    .string()
    .min(2, { message: "id must be grater or equal 2" })
    .or(z.number().transform(String)),
  chart_of_account_type: z.nativeEnum($Enums.ChartOfAccountType, {
    errorMap: (issue, ctx) => {
      return { message: "Required" };
    },
  }),
  parent_id: z.string().optional().nullable(),
  debit_credit: z.nativeEnum($Enums.DebitCreditType, {
    errorMap: (issue, ctx) => {
      return { message: "Required" };
    },
  }),
  account_type: z
    .nativeEnum($Enums.AccountType, {
      errorMap: (issue, ctx) => {
        return { message: "Required" };
      },
    })
    .optional()
    .nullable(),
  first_name: z.string().optional().nullable(),
  email: z.string().optional().nullable(),

  business_id: z.string().optional().nullable(),

  last_name: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone_number: z
    .string()
    .nullable()
    .optional()
    .refine(
      (e) => {
        if (e && e.length > 0) {
          console.log(e);
          return new RegExp(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
          ).test(e);
        } else {
          return true;
        }
      },
      { message: "Wrong phone number" }
    ),

  limit_amount: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional()
    .nullable(),
  currency_id: z
    .number()
    .or(z.string().regex(/^\d+$/).transform(Number))
    .optional()
    .nullable(),
});

type ChartOfAccountInputSchema = z.infer<typeof ChartOfAccountInputSchema>;
const ChartOfAccountSearchSchema = z.object({
  from: z.date(),
  accountId: z.string().optional().nullable(),
  classes: z.string().array().optional().nullable(),
  level: z.number().optional().nullable(),
  include_reffrence: z.boolean().optional().nullable(),
  id: z.string().optional().nullable(),
  chartOfAccountIds: z.string().array().optional().nullable(),
  to: z.date(),
  type: z.nativeEnum($Enums.AccountType).optional().nullable(),
});
type ChartOfAccountSearchSchema = z.infer<typeof ChartOfAccountSearchSchema>;
export { ChartOfAccountInputSchema, ChartOfAccountSearchSchema };
