import { Prisma } from "@prisma/client";
import { IChartOfAccountGrouped } from "@rms/Interfaces/IChartOfAccount";
import ChartOfAccountGrouped from "@rms/models/ChartOfAccountModel";
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
    include: {
      voucher_items: { include: { currency: true } };
      reffrence_voucher_items: { include: { currency: true } };
    };
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
  if (props?.length > 0) {
    props.map((res) => {
      total += res.voucher_items
        .filter((ress) => {
          return !ress.reffrence_chart_of_account_id;
        })
        .reduce((a, res) => {
          if (res.debit_credit === "Debit") {
            return (a += res.amount / res.currency.rate);
          } else if (res.debit_credit === "Credit") {
            return (a -= res.amount / res.currency.rate);
          }
        }, 0);
      if (res.account_type) {
        total += res.reffrence_voucher_items.reduce((a, res) => {
          if (res.debit_credit === "Debit") {
            return (a += res.amount / res.currency.rate);
          } else if (res.debit_credit === "Credit") {
            return (a -= res.amount / res.currency.rate);
          }
        }, 0);
      }
      return (total += totalChartOfAccountVouchers(res.subRows));
    });
    return total;
  } else {
    return total;
  }
}

export function exportToExcel({
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
    `${
      from && to
        ? `${dayjs(from).format("DD-MM-YYYY")}-${dayjs(to).format(
            "DD-MM-YYYY"
          )}`
        : ""
    }-${username ?? ""}-${type ?? ""}.xlsx`
  );
}

export function BalanceSheetTotal(data: ChartOfAccountGrouped) {
  let totalAmount = data.voucher_items.reduce((sum, voucher) => {
    if (voucher.debit_credit === "Debit") {
      return (sum + voucher.amount) / (voucher.rate ?? 1);
    } else if (voucher.debit_credit === "Credit") {
      return (sum - voucher.amount) / (voucher.rate ?? 1);
    }
  }, 0);
  if (data.subRows.length > 0) {
    // Recursively calculate total voucher amounts for each sub-row
    data.subRows.forEach((subRow) => {
      totalAmount += BalanceSheetTotal(subRow);
    });
  }

  return totalAmount;
}
export function cleanUpGroupChartOfAccount(data: IChartOfAccountGrouped[]) {
  return data.filter(
    (res) => data.filter((p) => res.parent_id === p.id).length === 0
  );
}
export function groupChartOfAccount(data: IChartOfAccountGrouped[]) {
  if (data.length === 0) return [];
  else {
    return data.map((res) => {
      const subRows = data.filter((res2) => res2.parent_id === res.id);

      res.subRows = groupChartOfAccount(subRows);

      return res;
    });
  }
}
