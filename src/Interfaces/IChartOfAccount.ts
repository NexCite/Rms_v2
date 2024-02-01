import { Prisma } from "@prisma/client";

export default interface IChartOfAccount
  extends Prisma.ChartOfAccountGetPayload<{
    include: typeof ChartOfAccountInclude;
  }> {
  total?: number;
}
export const ChartOfAccountInclude = {
  currency: true,
  voucher_items: {
    include: {
      voucher: { include: { currency: true } },

      currency: true,
    },
  },
  reffrence_voucher_items: {
    include: {
      voucher: { include: { currency: true } },

      currency: true,
    },
  },
};
export interface IChartOfAccountGrouped extends IChartOfAccount {
  subRows?: IChartOfAccountGrouped[];
}
