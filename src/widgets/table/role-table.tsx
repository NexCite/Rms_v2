"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { deleteRoleById } from "@rms/service/role-service";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";

type Props = {
  data: Prisma.RoleGetPayload<{}>[];
};

export default function RoleTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setPadding] = useTransition();

  const store = useStore();

  const columns = useMemo<MRT_ColumnDef<Prisma.RoleGetPayload<{}>>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ row: { original } }) => (
          <div
            className={`text-center rounded-sm ${
              original.create_date.toLocaleTimeString() !==
              original.modified_date.toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {original.id}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "create_date",
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },

      {
        accessorKey: "modified_date",
        header: "Modified Date",
        accessorFn: (e) => e.modified_date.toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
    ],
    []
  );

  return (
    <Card>
      <CardHeader
        title={<Typography variant="h5">Role Table</Typography>}
      ></CardHeader>
      <MaterialReactTable
        initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
        state={{ showProgressBars: isPadding }}
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, name },
          },
        }) => [
          <Authorized permission="Edit_Role" key={1}>
            <Link href={pathName + "/form?id=" + id}>
              <MenuItem className="cursor-pointer" disabled={isPadding}>
                Edit
              </MenuItem>
            </Link>
          </Authorized>,

          <Authorized permission="Delete_Role" key={3}>
            <MenuItem
              disabled={isPadding}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${name} id:${id} `
                );
                if (isConfirm) {
                  setPadding(async () => {
                    var result = await deleteRoleById(id);

                    store.OpenAlert(result);
                  });
                }
              }}
            >
              {isPadding ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.data}
        enableGlobalFilter
      />
    </Card>
  );
}
