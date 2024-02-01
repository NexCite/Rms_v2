import { Prisma } from "@prisma/client";

export default interface IVoucher
  extends Prisma.VoucherGetPayload<{
    include: {
      currency: true;
      user: true;
      voucher_items: {
        include: {
          currency: true;
          chart_of_account: true;
        };
      };
    };
  }> {}
export const IVoucherInclude = {
  currency: true,
  user: true,
  voucher_items: {
    include: {
      currency: true,
      chart_of_account: true,
    },
  },
};
