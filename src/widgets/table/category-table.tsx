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
import { deleteCategoryById } from "@rms/service/category-service";
import { deleteSubCategoryById } from "@rms/service/sub-category-service";
import Authorized from "@rms/components/ui/authorized";

type Props =
  | {
      node: "category";
      data: Prisma.CategoryGetPayload<{}>[];
    }
  | {
      node: "sub_category";
      data: Prisma.SubCategoryGetPayload<{}>[];
    };

export default function CategoryTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();
  const { push } = useRouter();

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "action",
        cell(originalRow) {
          const { id, name } = originalRow.row.original;

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
                  <Authorized permission="Edit_Category">
                    <DropdownMenuItem
                      onClick={() => push(pathName + "/form?id=" + id)}
                      className="cursor-pointer"
                      disabled={isActive}
                    >
                      Edit
                    </DropdownMenuItem>
                  </Authorized>

                  <Authorized permission="Delete_Category">
                    {" "}
                    <DropdownMenuItem
                      disabled={isActive}
                      className="cursor-pointer"
                      onClick={() => {
                        const isConfirm = confirm(
                          `Do You sure you want to delete ${name} id:${id} `
                        );
                        if (isConfirm) {
                          setActiveTransition(async () => {
                            const result =
                              props.node === "category"
                                ? await deleteCategoryById(id)
                                : await deleteSubCategoryById(id);

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
        accessorKey: "id", //simple recommended way to define a column
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
        accessorKey: "name", //simple recommended way to define a column
        header: "Name",
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
    [createAlert, props.node, isActive, pathName, push]
  );
  const table = useReactTable({
    data: props.data,
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
        <h1>Result: {props.data.length}</h1>
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
