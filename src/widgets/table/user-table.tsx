"use client";

import { usePathname } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import styled from "@emotion/styled";
import { Prisma } from "@prisma/client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Authorized from "@rms/components/ui/authorized";
import { Button } from "@rms/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rms/components/ui/dropdown-menu";
import { Input } from "@rms/components/ui/input";
import { deleteUserById } from "@rms/service/user-service";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import { useStore } from "@rms/hooks/toast-hook";

type Props = {
  users: Prisma.UserGetPayload<{}>[];
};

export default function UserTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const store = useStore();

  const { push } = useRouter();
  const columns = useMemo<MRT_ColumnDef<Prisma.UserGetPayload<{}>>[]>(
    () => [
      {
        header: "Status",
        accessorKey: "status",
      },

      {
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
        accessorKey: "username",
        header: "UserName",
      },
      {
        accessorKey: "first_name",
        header: "First Name",
      },
      {
        accessorKey: "last_name",
        header: "Last Name",
      },

      {
        accessorKey: "phone_number",
        header: "Phone number",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "gender",
        header: "Gender",
      },
      {
        accessorKey: "country",
        header: "Country",
      },
      {
        accessorKey: "address1",
        header: "Address 1",
      },
      {
        accessorKey: "address2",
        header: "Address 2",
      },
      {
        accessorKey: "create_date",
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
      },

      {
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
          columns={columns}
          data={props.users}
          enableRowActions
          renderRowActionMenuItems={({
            row: {
              original: { id, username },
            },
          }) => [
            <Authorized permission="Edit_Currency" key={1}>
              <MenuItem
                onClick={() => push(pathName + "/form?id=" + id)}
                className="cursor-pointer"
                disabled={isActive}
              >
                Edit
              </MenuItem>
            </Authorized>,

            <Authorized permission="Delete_Currency" key={3}>
              <MenuItem
                disabled={isActive}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete ${username} id:${id} `
                  );
                  if (isConfirm) {
                    setActiveTransition(async () => {
                      const result = await deleteUserById(id);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isActive ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
        />
      </Card>
    </div>
  );
}
