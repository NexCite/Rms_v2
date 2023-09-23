"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";

import styled from "styled-components";
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
  TableBody,
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rms/components/ui/table";
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
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { deleteUserById } from "@rms/service/user-service";

type Props = {
  users: Prisma.UserGetPayload<{}>[];
};

export default function UserTableComponent(props: Props) {
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
  const columns = useMemo<ColumnDef<Prisma.UserGetPayload<{}>>[]>(
    () => [
      {
        accessorKey: "action",
        cell(originalRow) {
          const { id, username } = originalRow.row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <DotsHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <Link
                    style={{ cursor: "pointer" }}
                    href={pathName + "/form?id=" + id}
                  >
                    <DropdownMenuItem
                      className="cursor-pointer"
                      disabled={isActive}
                    >
                      Edit
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem
                    disabled={isActive}
                    className="cursor-pointer"
                    onClick={() => {
                      const isConfirm = confirm(
                        `Do You sure you want to delete ${username} id:${id} `
                      );
                      if (isConfirm) {
                        setActiveTransition(async () => {
                          const result = await deleteUserById(id);

                          createAlert(result);
                        });
                      }
                    }}
                  >
                    {isActive ? <> deleteing...</> : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        accessorKey: "id", //simple recommended way to define a column
        header: "ID",
      },
      {
        accessorKey: "username", //simple recommended way to define a column
        header: "UserName",
      },
      {
        accessorKey: "first_name", //simple recommended way to define a column
        header: "First Name",
      },
      {
        accessorKey: "last_name", //simple recommended way to define a column
        header: "Last Name",
      },

      {
        accessorKey: "phone_number", //simple recommended way to define a column
        header: "Phone number",
      },
      {
        accessorKey: "email", //simple recommended way to define a column
        header: "Email",
      },
      {
        accessorKey: "gender", //simple recommended way to define a column
        header: "Gender",
      },
      {
        accessorKey: "country", //simple recommended way to define a column
        header: "Country",
      },
      {
        accessorKey: "address1", //simple recommended way to define a column
        header: "Address 1",
      },
      {
        accessorKey: "address2", //simple recommended way to define a column
        header: "Address 2",
      },
      {
        accessorKey: "create_date", //simple recommended way to define a column
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
      },

      {
        accessorKey: "modified_date", //simple recommended way to define a column
        header: "Modified Date",
        accessorFn: (e) => e.modified_date.toLocaleDateString(),
      },
    ],
    []
  );
  const table = useReactTable({
    data: props.users,
    columns: columns,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    state: {
      pagination: pagination,
      globalFilter,
    },
  });

  return (
    <Style>
      <div className="flex gap-6 flex-col">
        <div className="flex justify-between items-center ">
          <h1>Result: {props.users.length}</h1>
          <Link href={pathName + "/form"} className="">
            <Button type="button" className="">
              Add
            </Button>
          </Link>
        </div>
        <div className="max-w-xs">
          <Input
            placeholder="search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* Using Vanilla Mantine Table component here */}
        <div className="rounded-md border">
          <Table>
            {/* Use your own markup, customize however you want using the power of Tandiv Table */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} style={{ minWidth: "200px" }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header ??
                              header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell ??
                          cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Style>
  );
}
const Style = styled.div``;
