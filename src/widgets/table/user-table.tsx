"use client";

import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import { Prisma } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { deleteUserById } from "@rms/service/user-service";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";

type Props = {
  users: Prisma.UserGetPayload<{}>[];
};

export default function UserTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setPadding] = useTransition();

  const store = useStore();

  const columns = useMemo<MRT_ColumnDef<Prisma.UserGetPayload<{}>>[]>(
    () => [
      {
        header: "Status",
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "status",
      },

      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "id",
        header: "ID",
        Cell: ({ row: { original } }) => (
          <div
            className={`text-center rounded-sm ${
              original.status === "Deleted"
                ? "bg-red-500"
                : original.create_date.toLocaleTimeString() !==
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
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "username",
        header: "UserName",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "first_name",
        header: "First Name",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "last_name",
        header: "Last Name",
      },

      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "phone_number",
        header: "Phone number",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "email",
        header: "Email",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "gender",
        header: "Gender",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "country",
        header: "Country",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "address1",
        header: "Address 1",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "address2",
        header: "Address 2",
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "create_date",
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
      },

      {
        muiTableHeadCellProps: {
          align: "center",
        },

        muiTableBodyCellProps: {
          align: "center",
        },
        accessorKey: "modified_date",
        header: "Modified Date",
        accessorFn: (e) => e.modified_date.toLocaleDateString(),
      },
    ],
    []
  );

  return (
    <div>
      <Card>
        <CardHeader title={<Typography variant="h5">User Table</Typography>} />

        <MaterialReactTable
          initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
          state={{ showProgressBars: isPadding }}
          columns={columns}
          data={props.users}
          enableRowActions
          renderRowActionMenuItems={({
            row: {
              original: { id, username },
            },
          }) => [
            <Authorized permission="Edit_User" key={1}>
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
                    setPadding(async () => {
                      const result = await deleteUserById(id);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isPadding ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
        />
      </Card>
    </div>
  );
}
