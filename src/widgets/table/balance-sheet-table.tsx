"use client";
import { MenuItem } from "@mui/material";
import Authorized from "@rms/components/other/authorized";
import CacheStateModel from "@rms/models/CacheStateModel";

import { zodResolver } from "@hookform/resolvers/zod";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";

import { Option, Select } from "@mui/joy";
import { $Enums } from "@prisma/client";
import {
  AccountGrouped,
  FormatNumberWithFixed,
  exportToExcel,
  totalChartOfAccountVouchers,
} from "@rms/lib/global";
import { findBalanceSheet } from "@rms/service/chart-of-account-service";
import dayjs from "dayjs";
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
import { usePathname } from "next/navigation";
import {
  ReactHTMLElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { AiFillFileExcel } from "react-icons/ai";
import { MdSearch } from "react-icons/md";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ChartOfAccountSearchSchema } from "../../schema/chart-of-account-schema";

type Props = {
  accountId?: string;
  accountType?: $Enums.AccountType;
  onDateChange?: (from: Date, to: Date) => void;

  currenices?: {
    id?: number;
    name?: string;
    symbol?: string;
    rate?: number;
  }[];
  currency?: {
    id?: number;
    name?: string;
    symbol?: string;
    rate?: number;
  };
};

export default function BalanceSheetTable(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const [data, setData] = useState<AccountGrouped[]>([]);
  const filter = useFilter();
  const pathName = usePathname();
  const form = useForm<ChartOfAccountSearchSchema>({
    resolver: zodResolver(ChartOfAccountSearchSchema),
    defaultValues: {
      include_reffrence: false,
      from: dayjs(filter.fromDate).startOf("d").toDate(),
      to: dayjs(filter.toDate).endOf("d").toDate(),
      classes: ["1"],
      accountId: props.accountId,
    },
  });
  const [currency, setCurrency] = useState<{
    id?: number;
    name?: string;
    symbol?: string;
    rate?: number;
  }>(props.currency ?? undefined);
  const columns = useMemo(
    () => [
      columnGroupedDataHelper.accessor("id", {
        header: "ID",
        enableGrouping: false,
      }),
      columnGroupedDataHelper.accessor("name", {
        header: "Name",
        enableGrouping: false,
      }),

      columnGroupedDataHelper.accessor("class", {
        filterVariant: "multi-select",
        filterSelectOptions: Array.from({ length: 9 }).map((res, i) => i + ""),
        GroupedCell: ({ row, cell }) => {
          return <span>{cell.getValue()}</span>;
        },
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
          enableGrouping: false,
        }
      ),
      columnGroupedDataHelper.accessor(
        (row) => {
          const result = totalChartOfAccountVouchers([row]);
          return result;
        },
        {
          enableGrouping: false,
          Cell(params) {
            if (params.row.getAllCells()[7]?.getValue()) {
              const total = parseFloat(
                (params.row.getAllCells()[7]?.getValue() as string) ?? "0"
              );

              return (
                <span
                  className={`${
                    total >= 0 ? "bg-green-400" : "bg-red-400"
                  }  rounded-lg px-3 text-white`}
                >
                  {currency?.symbol ?? "$"}
                  {FormatNumberWithFixed(total * (currency?.rate ?? 1), 2)}{" "}
                </span>
              );
            } else {
              const total = params.cell.renderValue();
              return (
                <span
                  className={`${
                    params.cell.getValue() >= 0 ? "bg-green-400" : "bg-red-400"
                  }  rounded-lg px-3 text-white`}
                >
                  {currency?.symbol ?? "$"}
                  {FormatNumberWithFixed(total * (currency?.rate ?? 1), 2)}{" "}
                </span>
              );
            }
          },
          id: "total",
          header: "Total",
          AggregatedCell: ({ row }) => {
            if (row.getIsGrouped()) {
              const result = row._getAllCellsByColumnId();
              var total = 0;
              result["total"].row.subRows.map((res) => {
                if (
                  (res._getAllCellsByColumnId()["total"].getValue() as any)
                    ?.props
                ) {
                  return (total += parseFloat(
                    (
                      res
                        ._getAllCellsByColumnId()
                        ["total"].getValue() as ReactHTMLElement<any>
                    )?.props?.children[1].replace(/[$,]/g, "")
                  ));
                } else {
                  return (total += parseFloat(
                    res._getAllCellsByColumnId()["total"].getValue() as string
                  ));
                }
              });

              return (
                <span
                  className={`${
                    total >= 0 ? "bg-green-400" : "bg-red-400"
                  }  rounded-lg px-3 text-white`}
                >
                  {currency?.symbol ?? "$"}
                  {FormatNumberWithFixed(total * (currency?.rate ?? 1), 2)}
                </span>
              );
            }
            return undefined;
          },
        }
      ),
    ],
    [currency?.rate, currency?.symbol]
  );
  // const watch = useWatch({ control: form.control, name: ["from", "to"] });

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
    // onGlobalFilterChange: filter.setGlobalFilter,
    enableSelectAll: false,
    enableSubRowSelection: false,
    enableStickyFooter: true,

    // onGroupingChange: filter.setGroups,
    // onColumnFiltersChange: filter.setColumnsFilter,
    // onSortingChange: filter.setSorting,
    enableExpanding: true,
    enableRowActions: false,
    enableExpandAll: true,

    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
        <Authorized permission="Update_Chart_Of_Account" key={1}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,
        <Authorized permission="Delete_Chart_Of_Account" key={2}>
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

    // onExpandedChange: filter.setExpanded,
    enablePagination: false,
    // initialState: { showColumnFilters: filter.filterColumns?.length > 0 },

    filterFromLeafRows: true,
    // onShowColumnFiltersChange: filter.setShowColumnFilters,
    state: {
      // expanded: filter.expanded,
      // grouping: filter.groups,
      // showColumnFilters: filter.showColumnFilters,
      // showLoadingOverlay: isPadding,
      // sorting: filter.sorting,
      // globalFilter: filter.globalFilter,
      // columnFilters: filter.filterColumns,
    },
  });

  useEffect(() => {
    setTransition(() => {
      findBalanceSheet(form.formState.defaultValues).then((res) => {
        setData(res.result);
      });
    });
  }, [form.formState.defaultValues, props.accountId]);

  const handleSubimt = useCallback((values: ChartOfAccountSearchSchema) => {
    setTransition(() => {
      findBalanceSheet({
        from: values.from,
        to: values.to,
        accountId: values.accountId,
        classes: values.classes,
      }).then((res) => {
        setData(res.result);
      });
    });
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <form
          className=" p-5  gap-2 flex flex-col  "
          onSubmit={form.handleSubmit(handleSubimt)}
        >
          <div className="flex-col md:flex-row flex justify-between items-center gap-5">
            <Button
              className="nexcite-btn sm:w-full md:w-fit"
              startDecorator={<AiFillFileExcel />}
              onClick={(e) => {
                setTransition(() => {
                  exportToExcel({
                    to: form.getValues("to"),
                    from: form.getValues("from"),
                    sheet: "chart of account",
                    id: "chart-of-account-table",
                  });
                });
              }}
            >
              Export Excel
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
            <Controller
              name="classes"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl>
                  <FormLabel>Class</FormLabel>
                  <Select
                    multiple
                    value={field.value}
                    defaultValue={field.value}
                    onChange={(e, newValue) => {
                      field.onChange(newValue);
                    }}
                  >
                    {Array.from({ length: 9 }).map((res, i) => {
                      return (
                        <Option value={i + 1 + ""} key={i}>
                          {i + 1}
                        </Option>
                      );
                    })}
                  </Select>
                </FormControl>
              )}
            />

            {props.currenices?.length > 1 && (
              <div>
                <FormControl>
                  <FormLabel>Curreny</FormLabel>
                  <Select
                    value={currency}
                    onChange={(e, n) => {
                      setCurrency(n);
                    }}
                  >
                    {props.currenices.map((res, i) => {
                      return (
                        <Option value={res} key={i}>
                          {res.symbol}
                        </Option>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>
            )}
          </div>
        </form>

        <MaterialReactTable table={table} />
      </Card>
    </div>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<AccountGrouped>();

const useFilter = create<CacheStateModel>()(
  persist(
    (set, get) => ({
      filterColumns: [],
      fromDate: dayjs().startOf("D").toDate(),
      toDate: dayjs().endOf("D").toDate(),
      showColumnFilters: false,
      groups: [],
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },

      expanded: {},
      globalFilter: "",
      setExpanded(newValue) {
        if (typeof newValue === "function") {
          get().expanded = (
            newValue as (prevValue: MRT_ExpandedState) => MRT_ExpandedState
          )(get().expanded);
        } else {
          get().expanded = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },

      setShowColumnFilters(newValue) {
        if (typeof newValue === "function") {
          get().showColumnFilters = (
            newValue as (prevValue: boolean) => boolean
          )(get().showColumnFilters);
        } else {
          get().showColumnFilters = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setGlobalFilter(newValue) {
        if (typeof newValue === "function") {
          get().globalFilter = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().globalFilter);
        } else {
          get().globalFilter = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setColumnsFilter(newValue) {
        if (typeof newValue === "function") {
          get().filterColumns = (
            newValue as (
              prevValue: MRT_ColumnFiltersState
            ) => MRT_ColumnFiltersState
          )(get().filterColumns);
        } else {
          get().filterColumns = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setGroups(newValue) {
        if (typeof newValue === "function") {
          get().groups = (
            newValue as (prevValue: MRT_GroupingState) => MRT_GroupingState
          )(get().groups);
        } else {
          get().groups = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setFromDate(newValue) {
        if (typeof newValue === "function") {
          get().fromDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().fromDate)
          )
            .endOf("D")
            .toDate();
        } else {
          get().fromDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ fromDate: get().fromDate });
      },
      setToDate(newValue) {
        if (typeof newValue === "function") {
          get().toDate = dayjs(
            (newValue as (prevValue: Date) => Date)(get().toDate)
          )
            .endOf("D")
            .toDate();
        } else {
          get().toDate = dayjs(newValue).endOf("D").toDate();
        }
        set({ toDate: get().toDate });
      },
      sorting: [],
      setSorting(newValue) {
        if (typeof newValue === "function") {
          get().sorting = (
            newValue as (prevValue: MRT_SortingState) => MRT_SortingState
          )(get().sorting);
        } else {
          get().sorting = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
      setPagination(newValue) {
        if (typeof newValue === "function") {
          get().pagination = (
            newValue as (prevValue: MRT_PaginationState) => MRT_PaginationState
          )(get().pagination);
        } else {
          get().pagination = newValue;
        }

        set((prev) => ({ ...prev, ...get() }));
      },
    }),
    {
      name: "chart-of-account-table",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
