import { IChartOfAccountGrouped } from "@nexcite/Interfaces/IChartOfAccount";
import ChartOfAccountGrouped from "@nexcite/models/ChartOfAccountModel";
import { Prisma } from "@prisma/client";
import { utils, writeFileXLSX } from "xlsx";

export function FormatNumber(data: number, digit?: number) {
  return data ? data?.toFixed(digit).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
}
export function FormatNumberWithFixed(data: number, digit?: number) {
  digit = digit ?? 2;
  if (data === 0) {
    return "0";
  }

  if (data?.toFixed)
    return Math.max(data)
      ?.toFixed(digit)
      .replace(/\d(?=(\d{3})+\.)/g, "$&,");
}

interface ChartOfAccount
  extends Prisma.ChartOfAccountGetPayload<{
    include: {
      voucher_items: { include: { currency: true } };
      reference_voucher_items: { include: { currency: true } };
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
          return !ress.reference_chart_of_account_id;
        })
        .reduce((a, res) => {
          if (res.debit_credit === "Debit") {
            return (a += res.amount / res.currency.rate);
          } else if (res.debit_credit === "Credit") {
            return (a -= res.amount / res.currency.rate);
          }
        }, 0);
      if (res.account_type) {
        total += res.reference_voucher_items.reduce((a, res) => {
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
  fileName,
  type,
  sheet,
}: {
  sheet: string;
  to?: Date;
  from?: Date;
  id: string;
  username?: string;
  fileName?: string;
  type?: string;
}) {
  const clonedTable = document.getElementById(id);
  var headers = Array.from(clonedTable.querySelectorAll("thead th")).map(
    (header) => header.textContent?.replace("0", "") || ""
  );

  const data: any[] = [];

  clonedTable.querySelectorAll("tbody tr").forEach((row: any) => {
    const rowData: any = {};
    Array.from(row.cells).forEach((cell: any, index) => {
      rowData[headers[index].replace("0", "")] = cell.textContent?.trim() || "";
    });
    data.push(rowData);
  });
  clonedTable.querySelectorAll("tfoot tr").forEach((row: any) => {
    const rowData: any = {};
    Array.from(row.cells).forEach((cell: any, index) => {
      rowData[headers[index].replace("0", "")] = cell.textContent?.trim() || "";
    });
    data.push(rowData);
  });
  const workbook = utils.book_new();
  const js = utils.json_to_sheet(data);
  utils.book_append_sheet(workbook, js);
  writeFileXLSX(
    workbook,
    `${fileName}-${
      from?.toLocaleDateString() ?? new Date().toLocaleDateString()
    }-${to?.toLocaleDateString() ?? new Date().toLocaleDateString()}.xlsx`
  );
  // Convert the cloned table to an image using html2canvas
  // html2canvas(clonedTable).then((canvas) => {
  //   const imgData = canvas.toDataURL("image/png");

  //   // Create an Excel worksheet with an image
  //   const ws = utils.aoa_to_sheet([
  //     [{ s: { t: "s", z: "image/png" }, c: [{ v: imgData }] }],
  //   ]);
  //   const wb = utils.book_new();
  //   utils.book_append_sheet(wb, ws, "Sheet 1");

  //   // Save the Excel file
  //   writeFile(wb, `${fileName}.xlsx`);
  // });
  // const xlsxTable = utils.table_to_book(document.getElementById(id), {
  //   sheet,
  //   cellStyles: true,
  //   cellDates: true,
  //   bookVBA: true,

  //   sheetStubs: true,

  //   WTF: true,
  // });

  // write(xlsxTable, {
  //   bookType: "xlsx",
  //   bookSST: true,
  //   cellStyles: true,
  //   cellDates: true,
  //   bookVBA: true,
  //   compression: false,
  //   sheetStubs: true,
  //   ignoreEC: true,
  //   WTF: true,

  //   type: "base64",
  // });
  // writeFile(xlsxTable, `${fileName}.xlsx`);
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

export function searchParamsMapper(
  searchParams: URLSearchParams,
  isIdNumber?: boolean
) {
  const fromParam = searchParams.get("from"),
    toParam = searchParams.get("to"),
    idParam = searchParams.get("id"),
    filterParam = searchParams.get("filter"),
    digit = searchParams.get("digit");

  return {
    from: fromParam ? new Date(fromParam) : undefined,
    to: toParam ? new Date(toParam) : undefined,
    id: idParam ? (isIdNumber ? parseInt(idParam) : idParam) : undefined,
    filter: filterParam,
    digit: digit ? digit : undefined,
  };
}
