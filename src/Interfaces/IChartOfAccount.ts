import { Prisma } from "@prisma/client";

export default interface IChartOfAccount
  extends Prisma.ChartOfAccountGetPayload<{
    include: ChartOfAccountInclude;
  }> {}
export const ChartOfAccountInclude = {
  currency: true,
  voucher_items: {
    include: {
      voucher: { include: { currency: true } },

      currency: true,
    },
  },
  reference_voucher_items: {
    include: {
      voucher: { include: { currency: true } },

      currency: true,
    },
  },
};
export const ChartOfAccountIncludeWithDateFilter = (from: Date, to: Date) => ({
  currency: true,
  voucher_items: {
    where: {
      voucher: {
        to_date: {
          gte: from,
          lte: to,
        },
      },
    },
    include: {
      voucher: { include: { currency: true } },

      currency: true,
    },
  },
  reference_voucher_items: {
    include: {
      voucher: { include: { currency: true } },

      currency: true,
    },
  },
});
export type ChartOfAccountInclude = typeof ChartOfAccountInclude;
export interface IChartOfAccountGrouped extends IChartOfAccount {
  subRows?: IChartOfAccountGrouped[];
}
