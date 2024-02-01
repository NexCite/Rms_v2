import { Prisma } from "@prisma/client";

export default interface BalanceSheetModel
  extends Prisma.ChartOfAccountGetPayload<{
    include: {
      currency: true;
      reffrence_voucher_items: {
        include: { currency: true };
      };
      voucher_items: {
        include: { currency: true };
      };
    };
  }> {
  subRows?: BalanceSheetModel[];
}
