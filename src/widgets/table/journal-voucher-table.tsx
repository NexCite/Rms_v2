"use client";
import { Prisma } from "@prisma/client";
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
import React, { useCallback, useEffect, useState, useTransition } from "react";
import {
  JournalVouchers,
  VoucherSearchSchema,
} from "../schema/journal-voucher";
import dayjs from "dayjs";
import Table from "@mui/joy/Table";
import MenuItem from "@mui/joy/MenuItem";

import { FormatNumber } from "@rms/lib/global";
import Authorized from "@rms/components/ui/authorized";
import { usePathname } from "next/navigation";
import Link from "next/link";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";

import Input from "@mui/joy/Input";

import NexCiteButton from "@rms/components/button/nexcite-button";
import { MdSearch } from "react-icons/md";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { findVoucherService } from "@rms/service/voucher-service";
import TableStateModel from "@rms/models/TableStateModel";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Card } from "@mui/joy";

const columnHelper = createMRTColumnHelper<JournalVouchers>();

export default function JournalVoucherTable() {
  const [data, setData] = useState<JournalVouchers[]>([]);
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const filter = useFilter();
  const table = useMaterialReactTable({
    columns,
    enableRowActions: true,
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
    enableExpandAll: true,
    initialState: { showColumnFilters: filter.filterColumns?.length > 0 },
    onExpandedChange: filter.setExpanded,
    onPaginationChange: filter.setPagination,
    filterFromLeafRows: true,
    onShowColumnFiltersChange: filter.setShowColumnFilters,
    state: {
      expanded: filter.expanded,
      grouping: filter.groups,
      showColumnFilters: filter.showColumnFilters,
      pagination: filter.pagination,

      showLoadingOverlay: isPadding,
      sorting: filter.sorting,
      globalFilter: filter.globalFilter,
      columnFilters: filter.filterColumns,
    },
    renderRowActionMenuItems: ({
      row: {
        original: { id },
      },
    }) => [
      <Authorized permission="Edit_Chart_Of_Account" key={1}>
        <div className="w-[100px] text-center">
          <Link
            href={pathName + "/form?id=" + id}
            className="w-full block text-center"
          >
            Edit
          </Link>
        </div>
      </Authorized>,
      // <Authorized permission={"Reset"} key={2}>
      //   <MenuItem
      //     disabled={isPadding}
      //     className="cursor-pointer"
      //     onClick={() => {
      //       const isConfirm = confirm(
      //         `Do You sure you want to reset ${name} id:${id} `
      //       );
      //       if (isConfirm) {
      //         setTransition(async () => {
      //           const result = await reset(id);

      //           toast.OpenAlert(result);
      //         });
      //       }
      //     }}
      //   >
      //     {isPadding ? <> reseting...</> : "Reset"}
      //   </MenuItem>
      // </Authorized>,
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
    ],
    data: data,
    renderDetailPanel: ({ row }) => (
      <Table>
        <thead>
          <tr>
            <th>D/C</th>
            <th>Amount</th>
            <th>Account</th>
            <th>Reffrence Account</th>
            <th>Amount/Rate</th>
          </tr>
        </thead>
        <tbody>
          {row.original.voucher_items.map((res) => (
            <tr key={res.id}>
              <td>{res.debit_credit}</td>
              <td>
                {res.currency.symbol}
                {FormatNumber(res.amount, 2)}
              </td>

              <td>
                {res.chart_of_account.id} {res.chart_of_account.name}
              </td>

              <td>
                {res.reference_chart_of_account?.id}{" "}
                {res.reference_chart_of_account?.name}
              </td>
              <td>${res.amount / res.rate}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </Table>
    ),
  });

  const form = useForm<VoucherSearchSchema>({
    resolver: zodResolver(VoucherSearchSchema),
    defaultValues: {
      include_reffrence: false,
      chart_of_accounts: [],
      pageIndex: 0,
      pageSize: 10,

      from: dayjs().startOf("D").toDate(),
      to: dayjs().endOf("D").toDate(),
      currencies: [],
      id: undefined,
    },
  });
  useEffect(() => {
    setTransition(() => {
      findVoucherService(form.formState.defaultValues as any).then((res) => {
        setData(res.result);
      });
    });
  }, [form.formState.defaultValues]);

  useEffect(() => {}, [filter.pagination]);

  const handleSubmit = useCallback((values: VoucherSearchSchema) => {
    setTransition(() => {
      findVoucherService(values).then((res) => {
        setData(res.result);
      });
    });
  }, []);
  // useEffect(() => {
  //   handleSubmit({
  //     from: filter.fromDate,
  //     to: filter.toDate,
  //     pageIndex: filter.pagination.pageSize,
  //     pageSize: filter.pagination.pageIndex,
  //   });
  // }, [filter.fromDate, filter.pagination, filter.toDate, handleSubmit]);

  return (
    <Card>
      <form
        className="mb-5 flex flex-col gap-5 "
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex justify-end">
          <NexCiteButton
            label="Search"
            icon={<MdSearch />}
            isPadding={isPadding}
          ></NexCiteButton>
        </div>
        <div className="flex gap-5 flex-col">
          <div className="flex flex-col lg:flex-row  gap-5 items-center">
            <Controller
              control={form.control}
              name="id"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>Id</FormLabel>
                  <Input
                    onChange={(e) => {
                      field.onChange(
                        isNaN(e.target.valueAsNumber)
                          ? undefined
                          : e.target.valueAsNumber
                      );
                    }}
                    value={field.value}
                    placeholder="id"
                    type="number"
                  />
                </FormControl>
              )}
            />
            <Controller
              control={form.control}
              name="from"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>From Date</FormLabel>
                  <Input
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      field.onChange(
                        dayjs(e.target.valueAsDate).startOf("d").toDate()
                      )
                    }
                    placeholder="from date"
                    type="date"
                  />
                </FormControl>
              )}
            />
            <Controller
              control={form.control}
              name="to"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>To Date</FormLabel>
                  <Input
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      field.onChange(
                        dayjs(e.target.valueAsDate).endOf("d").toDate()
                      )
                    }
                    placeholder="to date"
                    type="date"
                  />
                </FormControl>
              )}
            />
            {/* <Controller
              control={form.control}
              name="chart_of_accounts"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                  {...field}
                >
                  <FormLabel>For</FormLabel>
                  <Autocomplete
                    multiple={true}
                    disableCloseOnSelect
                    limitTags={1}
                    onChange={(_, v) => {
                      field.onChange(v);
                    }}
                    options={props.chartOfAccounts}
                    getOptionKey={(e) => e.id}
                    getOptionLabel={(e: any) => `${e.id} ${e.name}`}
                    isOptionEqualToValue={(e) =>
                      field.value.find((res) => res.id === e.id) ? true : false
                    }
                    placeholder="for"
                    value={field.value}
                  />
                </FormControl>
              )}
            /> */}
          </div>
          {/* <div>
            <Controller
              control={form.control}
              name="include_reffrence"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                  {...field}
                >
                  <Typography
                    component="label"
                    endDecorator={
                      <Switch checked={field.value} sx={{ ml: 1 }} />
                    }
                  >
                    Include Reffrence
                  </Typography>
                </FormControl>
              )}
            />
          </div> */}
        </div>
      </form>

      <MaterialReactTable table={table} />
    </Card>
  );
}

const columns = [
  columnHelper.accessor("id", {
    header: "Id",
  }),
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor(
    (row) => dayjs(row.to_date).format("DD-MM-YYYY hh:mm a"),
    {
      id: "to_date",
      header: "Date",
    }
  ),
  columnHelper.accessor((row) => row.currency.name, {
    id: "currency_id",
    header: "Currency",
  }),
];
const useFilter = create<TableStateModel>()(
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
      name: "vocuher-account-table",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
