import { Prisma } from "@prisma/client";
import { type } from "os";

export default interface IVoucher
  extends Prisma.VoucherGetPayload<{
    include: VoucherIncludeType;
  }> {}

export const VoucherInclude = {
  _count: true,
  currency: true,
  user: true,
  voucher_items: {
    include: {
      reference_chart_of_account: {
        select: {
          name: true,
          id: true,
          account_type: true,
          first_name: true,
          last_name: true,
          currency: {
            select: {
              name: true,
              symbol: true,
              rate: true,
            },
          },
        },
      },
      chart_of_account: {
        select: {
          name: true,
          id: true,
          account_type: true,
          first_name: true,
          last_name: true,
          currency: {
            select: {
              name: true,
              symbol: true,
              rate: true,
            },
          },
        },
      },
      currency: true,
    },
  },
};
export type VoucherIncludeType = typeof VoucherInclude;
