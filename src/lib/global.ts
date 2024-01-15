import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { utils, write, writeFile } from "xlsx";

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
export interface VoucherSchema
  extends Prisma.VoucherGetPayload<{
    include: {
      currency: true;
      voucher_items: {
        include: {
          currency: true;
          chart_of_account: true;
          reference_chart_of_account: true;
        };
      };
    };
  }> {}

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
export function totalChartOfAccountVouchers(props: AccountGrouped[]) {
  var total = 0;
  console.log(props);
  if (props?.length > 0) {
    props.map((res) => {
      res.voucher_items.map((res) => {
        if (res.debit_credit === "Debit") {
          total += res.amount / res.currency.rate;
        } else if (res.debit_credit === "Credit") {
          total -= res.amount / res.currency.rate;
        }
      });
      return (total += totalChartOfAccountVouchers(res.subRows));
    });
    return total;
  } else {
    return total;
  }
}

export function exportToExcell({
  to,
  from,
  id,
  username,
  type,
  sheet,
}: {
  sheet: string;
  to?: Date;
  from?: Date;
  id: string;
  username?: string;
  type?: string;
}) {
  const xlsxTable = utils.table_to_book(document.getElementById(id), { sheet });
  write(xlsxTable, {
    bookType: "xlsx",
    bookSST: true,
    cellStyles: true,
    cellDates: true,
    bookVBA: true,
    compression: false,

    type: "base64",
  });
  writeFile(
    xlsxTable,
    `${dayjs(from).format("DD-MM-YYYY")}-${dayjs(to).format("DD-MM-YYYY")}-${
      username ?? ""
    }-${type ?? ""}.xlsx`
  );
}
