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
import { useStore } from "@rms/hooks/toast-hook";
import { deleteInvoiceById } from "@rms/service/invoice-service";
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

type Props = {
  invoices: Prisma.InvoiceGetPayload<{}>[];
};

export default function InvoiceTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const store = useStore();

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
                      disabled={isPadding}
                    >
                      Edit
                    </DropdownMenuItem>
                  </Authorized>
                  <Authorized permission="Delete_Invoice">
                    <DropdownMenuItem
                      disabled={isPadding}
                      className="cursor-pointer"
                      onClick={() => {
                        const isConfirm = confirm(
                          `Do You sure you want to delete invoice id:${id} `
                        );
                        if (isConfirm) {
                          setTransition(async () => {
                            const result = await deleteInvoiceById(id);

                            store.OpenAlert(result);
                          });
                        }
                      }}
                    >
                      {isPadding ? <> deleting...</> : "Delete"}
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
    [store.OpenAlert, , store]
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
        <div className="rms-container">
          {" "}
          <div className="rms-table">
            <table>
              {/* Use your own markup, customize however you want using the power of Tandiv Table */}
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} style={{ minWidth: "200px" }}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header ??
                                header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <th colSpan={columns.length} className="h-24 text-center">
                      No results.
                    </th>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell ??
                              cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
      </div>
    </Style>
  );
}
const Style = styled.div``;
