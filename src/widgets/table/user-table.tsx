"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { Card, Typography } from "@mui/joy";
import { MenuItem } from "@mui/material";
import { Prisma } from "@prisma/client";
import Authorized from "@rms/components/other/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import CacheStateModel from "@rms/models/CacheStateModel";
import { deleteUserById } from "@rms/service/user-service";
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
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Props = {
  users: Prisma.UserGetPayload<{ include: { role: true } }>[];
};

export default function UserTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const filter = useFilter();

  const toast = useToast();

  const table = useMaterialReactTable({
    columns,
    data: props.users,
    muiTableProps: { border: 0, className: "shadow-none" },
    enableRowActions: true,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
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
      // pagination: filter.pagination,

      showLoadingOverlay: isPadding,
      // sorting: filter.sorting,
      // globalFilter: filter.globalFilter,
      // columnFilters: filter.filterColumns,
    },
    editDisplayMode: "row",
    // onPaginationChange: filter.setPagination,

    renderRowActionMenuItems({
      row: {
        original: { username, id },
      },
    }) {
      return [
        <Authorized permission="Update_User" key={1}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,

        <Authorized permission="Delete_User" key={3}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${username} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await deleteUserById(id);
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
    <div>
      <Card>
        <Typography fontSize={23}>User Table</Typography>
        <MaterialReactTable table={table} />
      </Card>
    </div>
  );
}
const columnGroupedDataHelper =
  createMRTColumnHelper<Prisma.UserGetPayload<{ include: { role: true } }>>();

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
      name: "chart-of-account-table-account",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
const columns = [
  columnGroupedDataHelper.accessor("id", {
    header: "ID",
  }),
  columnGroupedDataHelper.accessor("username", {
    header: "UserName",
  }),
  columnGroupedDataHelper.accessor("first_name", {
    header: "First Name",
  }),
  columnGroupedDataHelper.accessor("last_name", {
    header: "Last Name",
  }),
  columnGroupedDataHelper.accessor("role.name", {
    header: "Role",
  }),
  columnGroupedDataHelper.accessor((e) => e.create_date.toLocaleDateString(), {
    id: "create_date",
    header: "Create Date",
  }),

  columnGroupedDataHelper.accessor(
    (e) => e.modified_date.toLocaleDateString(),
    {
      id: "modified_date",
      header: "Modified Date",
    }
  ),
];
