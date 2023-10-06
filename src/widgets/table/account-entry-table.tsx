"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";

import styled from "@emotion/styled";
import { Prisma } from "@prisma/client";
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import useAlertHook from "@rms/hooks/alert-hooks";
import { Button } from "@rms/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rms/components/ui/dropdown-menu";
type CommonAccountType = Prisma.Account_EntryGetPayload<{
  include: {
    more_than_four_digit: true;
    three_digit: true;
    two_digit: true;
  };
}>;
import { Input } from "@rms/components/ui/input";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { deleteAccountEntry } from "@rms/service/account-entry-service";
import Authorized from "@rms/components/ui/authorized";
import { Typography } from "@material-tailwind/react";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { Card, MenuItem } from "@mui/material";

type Props = {
  accounts: CommonAccountType[];
};

export default function AccountEntryTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();
  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const { push } = useRouter();
  const columns = useMemo<MRT_ColumnDef<CommonAccountType>[]>(
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
        header: "References",
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
        accessorKey: "digit" as any,
        header: "Digit",
        accessorFn: (e) =>
          `
          
         (${e.three_digit_id ?? ""}${e.two_digit_id ?? ""}${
            e.more_than_four_digit_id ?? ""
          })  ${e.three_digit?.name ?? ""}${e.two_digit?.name ?? ""}${
            e.more_than_four_digit?.name ?? ""
          }`,
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
    [createAlert, isActive, pathName, push]
  );

  return (
    <Style>
      <Card>
        <MaterialReactTable
          columns={columns}
          data={props.accounts}
          enableRowActions
          renderRowActionMenuItems={({
            row: {
              original: { username, id },
            },
          }) => [
            <Authorized permission="Edit_AccountEntry" key={1}>
              <MenuItem
                onClick={() => push(pathName + "/form?id=" + id)}
                className="cursor-pointer"
                disabled={isActive}
              >
                Edit
              </MenuItem>
            </Authorized>,
            <Authorized permission="Delete_AccountEntry" key={2}>
              <MenuItem
                disabled={isActive}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete ${username} id:${id} `
                  );
                  if (isConfirm) {
                    setActiveTransition(async () => {
                      const result = await deleteAccountEntry(id);

                      createAlert(result);
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
    </Style>
  );
}
const Style = styled.div``;
