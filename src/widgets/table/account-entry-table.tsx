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
  // return the filtered rows
  sortingFns,
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
import { rankItem, compareItems } from "@tanstack/match-sorter-utils";
import { Input } from "@rms/components/ui/input";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { deleteAccountEntry } from "@rms/service/account-entry-service";
import Authorized from "@rms/components/ui/authorized";

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
  const columns = useMemo<ColumnDef<CommonAccountType>[]>(
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
                  <Authorized permission="Edit_AccountEntry">
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
                  </Authorized>
                  <Authorized permission="Delete_AccountEntry">
                    <DropdownMenuItem
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
                    </DropdownMenuItem>
                  </Authorized>
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
        header: "References",
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
        accessorKey: "digit" as any, //simple recommended way to define a column
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
    [createAlert, isActive, pathName]
  );
  const table = useReactTable({
    data: props.accounts,
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
          <h1>Result: {props.accounts.length}</h1>
        </div>
        <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4 mb-5">
          <Input
            className="w-[250px]"
            placeholder="search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-full">
              <Button
                variant="outline"
                className="ml-auto w-full flex justify-between items-center"
              >
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-full">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Using Vanilla Mantine Table component here */}
        <div className="p-2">
          <Table>
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
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
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
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-end space-x-2 py-4">
            <h5>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()} page(s).
            </h5>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Style>
  );
}
const Style = styled.div``;
