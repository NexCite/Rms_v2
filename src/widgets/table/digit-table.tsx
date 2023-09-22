"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import React, { useMemo, useRef, useState, useTransition } from "react";
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
import { Input } from "@rms/components/ui/input";
import {
  Table,
  TableBody,
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
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { deleteMoreDigit, deleteTwoDigit } from "@rms/service/digit-service";

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
    []
  );
  const table = useReactTable({
    data: props.value[props.node],
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

  const ref = useRef<HTMLDivElement>();

  return (
    <div className="flex gap-6 flex-col">
      <div className="flex justify-between items-center ">
        <h1>Result: {props.value[props.node].length}</h1>
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
                      cell.column.columnDef.cell ?? cell.column.columnDef.cell,
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
  );
}