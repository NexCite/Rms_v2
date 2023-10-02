"use client";

import { usePathname } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";

import styled from "styled-components";
import { Prisma } from "@prisma/client";
import {
  ColumnDef,
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
import { useRouter } from "next/navigation";
import Authorized from "@rms/components/ui/authorized";
import { deleteInvoiceById } from "@rms/service/invoice-service";

type Props = {
  invoices: Prisma.InvoiceGetPayload<{}>[];
};

export default function InvoiceTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();
  const { push } = useRouter();
  const columns = useMemo<ColumnDef<Prisma.InvoiceGetPayload<{}>>[]>(
    () => [
      {
        accessorKey: "action",
        maxWidth: "20px",
        cell(originalRow) {
          const { id } = originalRow.row.original;

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
                  <Authorized permission="Edit_Invoice">
                    <DropdownMenuItem
                      onClick={() => push(pathName + "/form?id=" + id)}
                      className="cursor-pointer"
                      disabled={isActive}
                    >
                      Edit
                    </DropdownMenuItem>
                  </Authorized>
                  <Authorized permission="Delete_Invoice">
                    <DropdownMenuItem
                      disabled={isActive}
                      className="cursor-pointer"
                      onClick={() => {
                        const isConfirm = confirm(
                          `Do You sure you want to delete invoice id:${id} `
                        );
                        if (isConfirm) {
                          setActiveTransition(async () => {
                            const result = await deleteInvoiceById(id);

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
        header: "Status",
        accessorKey: "status",
      },
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row: { original } }) => (
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
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "debit_credit",
        header: "Type",
      },
      {
        accessorKey: "amount",
        header: "Amount",
      },
      {
        accessorKey: "discount",
        header: "Discount",
      },
      {
        accessorKey: "create_date",
        header: "Create Date",
        columnDefType: "data",
        id: "create_date",
        accessorFn: (p) => p.create_date?.toLocaleDateString(),
      },
      {
        accessorKey: "modified_date",
        header: "Modified Date",
        columnDefType: "data",
        id: "modified_date",
        accessorFn: (p) => p.modified_date?.toLocaleDateString(),
      },
    ],
    [createAlert, isActive, pathName, push]
  );
  const table = useReactTable({
    data: props.invoices,
    columns: columns,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    state: {
      globalFilter,
    },
  });

  return (
    <Style>
      <div className="flex gap-6 flex-col">
        <div className="flex justify-between items-center ">
          <h1>Result: {props.invoices.length}</h1>
        </div>
        <div className="max-w-xs">
          <Input
            placeholder="search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>

        {/* Using Vanilla Mantine Table component here */}
        <div className="p-2">
          <Table>
            {/* Use your own markup, customize however you want using the power of Tandiv Table */}
            <TableHeader>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              ) : (
                table.getHeaderGroups().map((headerGroup) => (
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
                ))
              )}
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
