"use client";
import { MenuItem } from "@mui/material";
import { Prisma } from "@prisma/client";
import LoadingClient from "@rms/components/other/loading-client";
import Authorized, { useAuthorized } from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import TableStateModel from "@rms/models/TableStateModel";
import { downloadExcel, useDownloadExcel } from "react-export-table-to-excel";

import {
  MRT_ColumnFiltersState,
  MRT_ExpandedState,
  MRT_GroupingState,
  MRT_PaginationState,
  MRT_SortingState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ReactHTML,
  ReactHTMLElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { DownloadTableExcel } from "react-export-table-to-excel";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Button from "@mui/joy/Button";
import { AiFillFileExcel } from "react-icons/ai";
import dayjs from "dayjs";
import { AccountGrouped, FormatNumberWithFixed } from "@rms/lib/global";
import Typography from "@mui/joy/Typography";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { findChartOfAccountByGrouping } from "@rms/service/chart-of-account-service";
import { MdSearch } from "react-icons/md";
import { ChartOfAccountSearchSchema } from "../schema/chart-of-account";

type Props = {};

export default function ChartOfAccountTable(props: Props) {
  // const isAuthorized = useAuthorized([
  //   "View_Chart_Of_Account",
  //   "Edit_Chart_Of_Account",
  //   "Delete_Chart_Of_Account",
  // ]);
  const toast = useToast();
  const [isPadding, setTransition] = useTransition();
  const [data, setData] = useState<AccountGrouped[]>([]);
  const filter = useFilter();
  const pathName = usePathname();
  const form = useForm<ChartOfAccountSearchSchema>({
    resolver: zodResolver(ChartOfAccountSearchSchema),
    defaultValues: {
      include_reffrence: false,
      from: dayjs(filter.fromDate).startOf("d").toDate(),
      to: dayjs(filter.fromDate).endOf("d").toDate(),
      id: undefined,
    },
  });
  const tableRef = useRef();
  useEffect(() => {
    if (global.window) {
      tableRef.current = document.getElementById(
        "chart-of-account-table"
      ) as any;
    }
  }, [data]);
  const { onDownload } = useDownloadExcel({
    currentTableRef: tableRef.current,
    filename: `${dayjs(filter.fromDate).format("DD-MM-YYYY")}-${dayjs(
      filter.toDate
    ).format("DD-MM-YYYY")}`,
    sheet: "Chart Of Account",
  });

  const table = useMaterialReactTable({
    columns,
    data,
    muiTableHeadCellProps: {
      align: "left",
    },
    muiTableProps: { id: "chart-of-account-table" },
    enableRowSelection: false,
    enableStickyHeader: true,
    enableClickToCopy: true,
    enableGlobalFilter: false,
    enableGrouping: true,
    onGlobalFilterChange: filter.setGlobalFilter,
    enableSelectAll: false,
    enableSubRowSelection: false,
    enableStickyFooter: true,
    onGroupingChange: filter.setGroups,
    onColumnFiltersChange: filter.setColumnsFilter,
    onSortingChange: filter.setSorting,
    enableExpanding: true,
    enableRowActions: true,
    enableExpandAll: true,

    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
        <Authorized permission="Edit_Chart_Of_Account" key={1}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
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
                  // const result = await deleteChart(id);
                  // toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> deleting...</> : "Delete"}
          </MenuItem>
        </Authorized>,
      ];
    },

    muiTableBodyCellProps: {
      align: "left",
    },

    onExpandedChange: filter.setExpanded,
    enablePagination: false,
    initialState: { showColumnFilters: filter.filterColumns?.length > 0 },

    filterFromLeafRows: true,
    state: {
      expanded: filter.expanded,
      grouping: filter.groups,

      showLoadingOverlay: isPadding,
      sorting: filter.sorting,
      globalFilter: filter.globalFilter,
      columnFilters: filter.filterColumns,
    },
  });
  useEffect(() => {
    setTransition(() => {
      findChartOfAccountByGrouping(form.formState.defaultValues, true).then(
        (res) => {
          setData(res.result.groupedTabls);
        }
      );
    });
  }, [form.formState.defaultValues]);

  const handleSubimt = useCallback((values: ChartOfAccountSearchSchema) => {
    setTransition(() => {
      findChartOfAccountByGrouping(
        {
          from: values.from,
          to: values.to,
        },
        true
      ).then((res) => {
        setData(res.result.groupedTabls);
      });
    });
  }, []);
  return (
    <LoadingClient>
      <form
        className="border p-5  gap-2 flex flex-col "
        onSubmit={form.handleSubmit(handleSubimt)}
      >
        <div className="flex-col md:flex-row flex justify-between items-center gap-5">
          <Button
            className="nexcite-btn sm:w-full md:w-fit"
            startDecorator={<AiFillFileExcel />}
            onClick={(e) => {
              setTransition(() => {
                onDownload();
              });
            }}
          >
            Export Excal
          </Button>
          <Button
            loading={isPadding}
            className="nexcite-btn sm:w-full md:w-fit"
            startDecorator={<MdSearch />}
            type="submit"
          >
            Search
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 gap-5">
          <Controller
            name="from"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl>
                <FormLabel>From</FormLabel>
                <Input
                  fullWidth
                  type="date"
                  onChange={(e) => {
                    const date = dayjs(e.target.valueAsDate)
                      .startOf("D")
                      .toDate();

                    filter.setFromDate(date);
                    field.onChange(date);
                  }}
                  value={dayjs(filter?.fromDate).format("YYYY-MM-DD")}
                />
              </FormControl>
            )}
          />
          <Controller
            name="to"
            control={form.control}
            render={({ field, fieldState, formState }) => (
              <FormControl>
                <FormLabel>To</FormLabel>
                <Input
                  fullWidth
                  type="date"
                  onChange={(e) => {
                    const date = dayjs(e.target.valueAsDate)
                      .endOf("D")
                      .toDate();

                    filter.setToDate(date);
                    field.onChange(date);
                  }}
                  value={dayjs(filter?.toDate).format("YYYY-MM-DD")}
                />
              </FormControl>
            )}
          />
        </div>
      </form>

      <MaterialReactTable table={table} />
    </LoadingClient>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<AccountGrouped>();

function totalChartOfAccountVouchers(props: AccountGrouped[]) {
  var total = 0;
  if (props.length > 0) {
    props.map((res) => {
      res.voucher_items.map((res) => {
        if (res.debit_credit === "Debit") {
          total += res.amount / res.currency.rate;
        } else {
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
const columns = [
  columnGroupedDataHelper.accessor("id", {
    header: "ID",
    enableColumnActions: true,
  }),
  columnGroupedDataHelper.accessor("name", {
    header: "Name",
  }),

  columnGroupedDataHelper.accessor("class", {
    header: "Class",
  }),
  columnGroupedDataHelper.accessor(
    (row) => row.chart_of_account_type?.replaceAll("_", " "),
    {
      id: "chart_of_account_type",
      header: "Account Type",
      GroupedCell: ({ row, cell }) => {
        return cell.getValue();
      },
    }
  ),
  columnGroupedDataHelper.accessor(
    (row) => row.debit_credit?.replaceAll("_", "/"),
    {
      id: "debit_credit",
      header: "D/C",
    }
  ),
  columnGroupedDataHelper.accessor(
    (row) => {
      const result = totalChartOfAccountVouchers([row]);
      return (
        <span
          className={`${
            result >= 0 ? "bg-green-400" : "bg-red-400"
          }  rounded-lg px-3 text-white`}
        >
          ${FormatNumberWithFixed(result, 2)}
        </span>
      );
    },
    {
      id: "total",
      header: "Total",
      AggregatedCell: ({ row }) => {
        if (row.getIsGrouped()) {
          const result = row._getAllCellsByColumnId();
          var total = 0;
          result["total"].row.subRows.map((res) => {
            return (total += parseFloat(
              (
                res
                  ._getAllCellsByColumnId()
                  ["total"].getValue() as ReactHTMLElement<any>
              )?.props.children[1].replace(/[$,]/g, "")
            ));
          });

          return (
            <span
              className={`${
                total >= 0 ? "bg-green-400" : "bg-red-400"
              }  rounded-lg px-3 text-white`}
            >
              ${FormatNumberWithFixed(total, 2)}
            </span>
          );
        }
        return undefined;
      },
    }
  ),
];
const useFilter = create<TableStateModel>()(
  persist(
    (set, get) => ({
      filterColumns: [],
      fromDate: dayjs().startOf("D").toDate(),
      toDate: dayjs().endOf("D").toDate(),

      groups: [],
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
      expanded: {},
      globalFilter: "",
      setExpanded(newValue) {
        if (typeof newValue === "function") {
          this.expanded = (
            newValue as (prevValue: MRT_ExpandedState) => MRT_ExpandedState
          )(get().expanded);
        } else {
          this.expanded = newValue;
        }
        set(this);
      },
      setGlobalFilter(newValue) {
        if (typeof newValue === "function") {
          this.globalFilter = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().globalFilter);
        } else {
          this.globalFilter = newValue;
        }
        set(this);
      },
      setColumnsFilter(newValue) {
        if (typeof newValue === "function") {
          this.filterColumns = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().filterColumns);
        } else {
          this.filterColumns = newValue;
        }
        set(this);
      },
      setGroups(newValue) {
        if (typeof newValue === "function") {
          this.groups = (
            newValue as (prevValue: MRT_GroupingState) => MRT_GroupingState
          )(get().groups);
        } else {
          this.groups = newValue;
        }
        set(this);
      },
      setFromDate(newValue) {
        if (typeof newValue === "function") {
          this.fromDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().fromDate)
          )
            .endOf("D")
            .toDate();
        } else {
          this.fromDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ fromDate: this.fromDate });
      },
      setToDate(newValue) {
        if (typeof newValue === "function") {
          this.toDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().toDate)
          )
            .endOf("D")
            .toDate();
        } else {
          this.toDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ toDate: this.toDate });
      },
      sorting: [],
      setSorting(newValue) {
        if (typeof newValue === "function") {
          this.sorting = (
            newValue as (prevValue: MRT_SortingState) => MRT_SortingState
          )(get().sorting);
        } else {
          this.sorting = newValue;
        }
        set(this);
      },
      setPagination(newValue) {
        if (typeof newValue === "function") {
          this.pagination = (
            newValue as (prevValue: MRT_PaginationState) => MRT_PaginationState
          )(get().pagination);
        } else {
          this.pagination = newValue;
        }
        set(this);
      },
    }),
    {
      name: "chart-of-account-table",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
