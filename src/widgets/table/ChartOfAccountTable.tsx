"use client";
import { MenuItem } from "@mui/material";
import { $Enums, Prisma } from "@prisma/client";
import Authorized from "@nexcite/components/other/Authorized";
import { useToast } from "@nexcite/hooks/toast-hook";

import { Stack } from "@mui/joy";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import IChartOfAccount from "@nexcite/Interfaces/IChartOfAccount";
import { FormatNumberWithFixed, exportToExcel } from "@nexcite/lib/global";
import { deleteChartOfAccountService } from "@nexcite/service/chart-of-account-service";
import {
  MRT_ColumnFiltersState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AiFillFileExcel } from "react-icons/ai";

type Props = {
  node: $Enums.AccountType;
  parents: Prisma.ChartOfAccountGetPayload<{}>[];
  currencies: Prisma.CurrencyGetPayload<{}>[];
  data: IChartOfAccount[];
};

export default function ChartOfAccountTable(props: Props) {
  const toast = useToast();
  const [isPadding, setTransition] = useTransition();
  const searchParams = useSearchParams();
  const columnFilter = useMemo(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      return JSON.parse(filter) as MRT_ColumnFiltersState;
    }
    return [];
  }, [searchParams]);

  const columns = useMemo(
    () =>
      [
        columnGroupedDataHelper.accessor("id", {
          header: "ID",
          filterVariant: "autocomplete",

          enableColumnActions: true,
        }),
        columnGroupedDataHelper.accessor("business_id", {
          header: "Business ID",
          filterVariant: "autocomplete",

          enableColumnActions: true,
        }),
        columnGroupedDataHelper.accessor("name", {
          header: "Name",
          filterVariant: "autocomplete",
        }),
        columnGroupedDataHelper.accessor((row) => row.currency?.name, {
          id: "currency.name",
          filterVariant: "multi-select",

          filterSelectOptions: props.currencies.map((res) => res.name),

          header: "Currency",
        }),

        columnGroupedDataHelper.accessor("class", {
          filterVariant: "multi-select",
          filterSelectOptions: Array.from({ length: 9 }).map(
            (res, i) => i + ""
          ),

          header: "Class",
        }),
        columnGroupedDataHelper.accessor("parent_id", {
          header: "Parent ID",
          enableGrouping: true,
        }),
        columnGroupedDataHelper.accessor(
          (row) => row.chart_of_account_type?.replaceAll("_", " "),
          {
            id: "chart_of_account_type",
            header: "Account Type",
            filterVariant: "multi-select",

            filterSelectOptions: Object.keys($Enums.ChartOfAccountType),
            GroupedCell: ({ row, cell }) => {
              return cell.getValue();
            },
          }
        ),
        columnGroupedDataHelper.accessor(
          (row) => row.debit_credit?.replaceAll("_", "/"),
          {
            id: "debit_credit",
            filterVariant: "multi-select",
            filterSelectOptions: Object.keys($Enums.DebitCreditType),

            header: "D/C",
          }
        ),
      ].concat(
        props.node
          ? ([
              columnGroupedDataHelper.accessor(
                (row) => {
                  var total = 0;
                  row.voucher_items.map((res) => {
                    if (res.debit_credit === "Debit") {
                      total += res.amount / res.rate;
                    } else {
                      total -= res.amount / res.rate;
                    }
                  });
                  row.reference_voucher_items?.map((res) => {
                    if (res.debit_credit === "Debit") {
                      total += res.amount / res.rate;
                    } else {
                      total -= res.amount / res.rate;
                    }
                  });

                  return total * (row.currency?.rate ?? 1);
                },
                {
                  id: "total",
                  header: "Total",
                  filterVariant: "range",
                  filterFn: (row, name, range: string[]) => {
                    const total = row.getAllCells()[9].getValue() as string;
                    //

                    const minNumber = range[0];
                    const maxNumber = range[1];

                    if (minNumber && maxNumber) {
                      return total >= minNumber && total <= maxNumber;
                    } else if (minNumber) {
                      return total >= minNumber;
                    } else if (maxNumber) {
                      return total <= maxNumber;
                    }

                    // const minNumber=parseFloat(min)
                    return true;
                  },
                  Cell({
                    cell,
                    row: {
                      getAllCells,
                      original: { currency },
                    },
                  }) {
                    const total = cell.renderValue() as number;

                    return (
                      <span
                        className={`${
                          total >= 0 ? "bg-green-400" : "bg-red-400"
                        }  rounded-lg px-3 text-white`}
                      >
                        {currency?.symbol ?? "$"}
                        {FormatNumberWithFixed(total, 2)}
                      </span>
                    );
                  },
                }
              ) as any,
            ] as any)
          : []
      ),
    [props.currencies, props.node]
  );

  const [filter, setFilter] = useState<MRT_ColumnFiltersState>(columnFilter);
  useEffect(() => {
    window.history.replaceState(null, "", `?filter=${JSON.stringify(filter)}`);
  }, [filter]);
  const table = useMaterialReactTable({
    columns,
    data: props.data,
    muiTableHeadCellProps: {
      align: "left",
    },

    muiTableProps: { id: "chart-of-account-table-" + props.node },
    enableStickyHeader: true,

    enableRowActions: true,

    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
        <Authorized permission="Update_Chart_Of_Account" key={1}>
          <Link href={"/admin/accounting/chart_of_account" + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,
        <Authorized permission="View_Chart_Of_Account" key={2}>
          <MenuItem disabled={isPadding} className="cursor-pointer">
            <Link href={"/admin/accounting/chart_of_account/" + id}>View</Link>
          </MenuItem>
        </Authorized>,
        <Authorized permission="Delete_Chart_Of_Account" key={3}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${name} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await deleteChartOfAccountService(id);
                  toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> deleting...</> : "Delete"}
          </MenuItem>
        </Authorized>,
      ];
    },
    onColumnFiltersChange: setFilter,

    muiTableBodyCellProps: {
      align: "left",
    },

    enablePagination: false,
    muiTableContainerProps: { sx: { maxHeight: "auto" } },
    initialState: { showColumnFilters: true },
    state: {
      columnFilters: filter,
      showLoadingOverlay: isPadding,
    },
  });

  return (
    <Stack>
      <Card className="mb-5">
        <CardContent>
          <Typography className="text-2xl capitalize">
            Total Accounts
          </Typography>
          <Typography className="text-end text-3xl">
            {FormatNumberWithFixed(props.data.length, 0)}
          </Typography>
        </CardContent>
      </Card>
      <Card>
        <Stack direction={"row"} spacing={3}>
          <Button
            className="nexcite-btn sm:w-full md:w-fit"
            startDecorator={<AiFillFileExcel />}
            onClick={(e) => {
              setTransition(() => {
                exportToExcel({
                  sheet: "chart of account " + props.node,
                  fileName: "Chart Of Account " + props.node,
                  id: "chart-of-account-table-" + props.node,
                });
              });
            }}
          >
            Export Excel
          </Button>
        </Stack>

        <MaterialReactTable table={table} />
      </Card>
    </Stack>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<IChartOfAccount>();
