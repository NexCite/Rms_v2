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
import { $Enums, Prisma } from "@prisma/client";
import {
  AccountGrouped,
  BalanceSheetTotal,
  FormatNumberWithFixed,
  exportToExcel,
  totalChartOfAccountVouchers,
} from "@rms/lib/global";
import {
  findBalanceSheet,
  findChartOfAccountVouchers,
} from "@rms/service/chart-of-account-service";
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
  use,
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
import ChartOfAccountGrouped from "@rms/models/ChartOfAccountModel";

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

export default function BalanceSheetTableTest(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const [data, setData] = useState<ChartOfAccountGrouped[]>([]);
  const filter = useFilter();
  const pathName = usePathname();
  useEffect(() => {
    findChartOfAccountVouchers().then((res) => {
      function cleanUp(data: ChartOfAccountGrouped[]) {
        return data.filter(
          (res) => data.filter((p) => res.parent_id === p.id).length === 0
        );
      }

      setData(cleanUp(res));
    });
  }, []);

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
      columnGroupedDataHelper.accessor(undefined, {
        id: "total",
        header: "Total",
        Cell: ({ row: { original } }) => {
          const total = BalanceSheetTotal(original);

          return (
            <span>
              {original.currency?.symbol ?? "$"}
              {FormatNumberWithFixed(total * (original.currency?.rate ?? 1), 3)}
            </span>
          );
        },
      }),
    ],
    []
  );
  // const watch = useWatch({ control: form.control, name: ["from", "to"] });
  const table = useMaterialReactTable({
    columns,
    data: data,
    enableExpanding: true,
  });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <MaterialReactTable table={table} />
      </Card>
    </div>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<ChartOfAccountGrouped>();

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
