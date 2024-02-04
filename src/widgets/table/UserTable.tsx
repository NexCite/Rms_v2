"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { Card, Typography } from "@mui/joy";
import { MenuItem } from "@mui/material";
import Authorized from "@nexcite/components/other/Authorized";
import { useToast } from "@nexcite/hooks/toast-hook";
import { deleteUserById } from "@nexcite/service/user-service";
import { Prisma } from "@prisma/client";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";

type Props = {
  users: Prisma.UserGetPayload<{ include: { role: true } }>[];
};

export default function UserTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

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
