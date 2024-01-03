import { Prisma } from "@prisma/client";
import route from "@rms/assets/route";
import { headers } from "next/headers";

export function FormatNumber(data: number, digit?: number) {
  return data ? data?.toFixed(digit).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
}
export function FormatNumberWithFixed(data: number, digit?: number) {
  digit = digit ?? 2;
  if (data === 0) {
    return "0";
  }
  if (data?.toFixed)
    return data?.toFixed(digit).replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

interface ChartOfAccount
  extends Prisma.ChartOfAccountGetPayload<{
    include: { voucher_items: { include: { currency: true } } };
  }> {}
export type AccountGrouped = ChartOfAccount & {
  subRows?: AccountGrouped[];
};

export const groupChartOfAccountByParentId = (
  data: ChartOfAccount[]
): AccountGrouped[] => {
  const buildTree = (
    items: ChartOfAccount[],
    parentId: string | null = null
  ): AccountGrouped[] => {
    return items
      .filter((item) => item.parent_id === parentId)
      .map((item) => ({
        ...item,
        subRows: buildTree(items, item.id),
      }));
  };

  return buildTree(data, null);
};
