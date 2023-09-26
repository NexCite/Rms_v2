"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useRef, useState, useTransition } from "react";
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
import { Input } from "@rms/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { deleteMoreDigit, deleteTwoDigit } from "@rms/service/digit-service";
import Authorized from "@rms/components/ui/authorized";

type Props = {
  node: CommonNode;
  value: {
    two: Prisma.Two_DigitGetPayload<{}>[];
    three: Prisma.Three_DigitGetPayload<{}>[];
    more: Prisma.More_Than_Four_DigitGetPayload<{}>[];
  };
};
type CommonNode = "two" | "three" | "more";

export default function DigitTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();
  const { push } = useRouter();

  const columns = useMemo<ColumnDef<any>[]>(
    () =>
      [
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
                    <Authorized
                      permission={
                        props.node === "two"
                          ? "Edit_Two_Digit"
                          : props.node === "three"
                          ? "Edit_Three_Digit"
                          : "Edit_More_Than_Four_Digit"
                      }
                    >
                      <DropdownMenuItem
                        onClick={() => push(pathName + "/form?id=" + id)}
                        className="cursor-pointer"
                        disabled={isActive}
                      >
                        Edit
                      </DropdownMenuItem>
                    </Authorized>
                    <Authorized
                      permission={
                        props.node === "two"
                          ? "Delete_Two_Digit"
                          : props.node === "three"
                          ? "Delete_Three_Digit"
                          : "Delete_More_Than_Four_Digit"
                      }
                    >
                      <DropdownMenuItem
                        disabled={isActive}
                        className="cursor-pointer"
                        onClick={() => {
                          const isConfirm = confirm(
                            `Do You sure you want to delete ${username} id:${id} `
                          );
                          if (isConfirm) {
                            setActiveTransition(async () => {
                              const result =
                                props.node === "two"
                                  ? await deleteTwoDigit(id)
                                  : props.node === "three"
                                  ? await deleteTwoDigit(id)
                                  : await deleteMoreDigit(id);

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
          header: "Id",
          id: "id",
        },

        {
          accessorKey: "name", //simple recommended way to define a column
          header: "Name",
        },
        {
          accessorKey: "type", //simple recommended way to define a column
          header: "Type",
        },
        {
          accessorKey: "debit_credit", //simple recommended way to define a column
          header: "Debit/Credit",
        },
      ]
        .concat(
          props.node !== "two"
            ? ([
                {
                  accessorKey: props.node === "three" ? "two" : "three", //simple recommended way to define a column
                  header: props.node === "three" ? "Two Digit" : "Three Digit",
                  accessorFn: (p) =>
                    `(${p.two_digit?.id ?? ""}${p.three_digit?.id ?? ""}) ${
                      p.two_digit?.name ?? ""
                    }${p.three_digit?.name ?? ""}  `,
                },
              ] as any)
            : []
        )
        .concat([
          {
            accessorKey: "create_date", //simple recommended way to define a column
            header: "Create Date",
            columnDefType: "data",
            id: "create_date",
            accessorFn: (p) => p.create_date?.toLocaleDateString(),
          },

          {
            accessorKey: "modified_date", //simple recommended way to define a column
            header: "Modified Date",
            columnDefType: "data",
            id: "modified_date",
            accessorFn: (p) => p.modified_date?.toLocaleDateString(),
          },
        ] as any),
    [createAlert, props.node, isActive, pathName]
  );
  const table = useReactTable({
    data: props.value[props.node],
    columns: columns,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    state: {
      globalFilter,
    },
  });

  const ref = useRef<HTMLDivElement>();

  return (
    <div className="flex gap-6 flex-col">
      <div className="flex justify-between items-center ">
        <h1>Result: {props.value[props.node].length}</h1>
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
  );
}
