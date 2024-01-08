"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { MenuItem } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import { AccountGrouped, FormatNumberWithFixed } from "@rms/lib/global";
import { deleteCurrency, resetCurrency } from "@rms/service/currency-service";
import {
  MRT_ColumnDef,
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
import useHistoryStore from "@rms/hooks/history-hook";
import ExportData from "@rms/components/other/export-data";
import { deleteAccountEntry } from "@rms/service/account-entry-service";
import LoadingClient from "@rms/components/other/loading-client";
import TableStateModel from "@rms/models/TableStateModel";
import dayjs from "dayjs";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Card, Typography } from "@mui/joy";

type Props = {
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

export default function CurrencyTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
  const historyTablePageStore = useHistoryStore<MRT_PaginationState>(
    "currency-table-page",
    { pageIndex: 0, pageSize: 100 }
  )();
  const [loading, setLoading] = useState(true);
  const filter = useFilter();
  useEffect(() => {
    setLoading(false);
  }, []);
  const table = useMaterialReactTable({
    columns,
    data: props.currencies,
    enableRowActions: true,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },

    onExpandedChange: filter.setExpanded,
    enablePagination: false,
    initialState: { showColumnFilters: filter.filterColumns?.length > 0 },

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
    editDisplayMode: "row",
    onPaginationChange: filter.setPagination,

    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
        <Authorized permission="Edit_Currency" key={1}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,

        <Authorized permission="Delete_Currency" key={3}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${name} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await deleteCurrency(id);
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
  });

  return (
    <Card variant="outlined">
      <Typography fontSize={23}>Currency Table</Typography>
      <MaterialReactTable table={table} />
    </Card>
  );
}

const columnsHelper = createMRTColumnHelper<Prisma.CurrencyGetPayload<{}>>();
const columns = [
  columnsHelper.accessor("id", {
    header: "ID",
  }),
  columnsHelper.accessor("name", {
    header: "Name",
  }),
  columnsHelper.accessor("symbol", {
    header: "Symbol",
  }),

  columnsHelper.accessor((row) => row.create_date.toLocaleDateString(), {
    id: "create_date",

    header: "Create Date",
  }),

  columnsHelper.accessor((row) => row.modified_date.toLocaleDateString(), {
    id: "modified_date",

    header: "Modified Date",
  }),
  columnsHelper.accessor("rate", {
    header: "Rate",
    Cell(props) {
      return FormatNumberWithFixed(props.row.original.rate, 2);
    },
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
      name: "chart-of-account-table",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
