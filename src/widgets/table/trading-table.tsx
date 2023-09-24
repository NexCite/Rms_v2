"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo, useState, useTransition } from "react";
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
import { deleteBrokerById } from "@rms/service/broker-service";
import { deleteTraderById } from "@rms/service/trader-service";
import { deleteAccountById } from "@rms/service/trading-account-service";

type Props =
  | {
      node: "account";
      data: Prisma.AccountGetPayload<{ include: { trader: true } }>[];
    }
  | {
      node: "trader";
      data: Prisma.TraderGetPayload<{ include: { broker: true } }>[];
    }
  | {
      node: "broker";
      data: Prisma.BrokerGetPayload<{}>[];
    };

export default function TradingTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();

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
                            var result;

                            switch (props.node) {
                              case "broker": {
                                result = await deleteBrokerById(id);
                                break;
                              }
                              case "trader": {
                                result = await deleteTraderById(id);
                                break;
                              }
                              case "account": {
                                result = await deleteAccountById(id);
                                break;
                              }
                            }

                            createAlert(result);
                          });
                        }
                      }}
                    >
                      {isActive ? <> deleting...</> : "Delete"}
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
      ]
        .concat(
          props.node !== "account"
            ? [
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
              ]
            : ([] as any)
        )
        .concat(
          props.node !== "broker"
            ? [
                {
                  accessorKey:
                    props.node === "trader"
                      ? "trader.username"
                      : "broker.username",
                  header: props.node === "trader" ? "Trader" : "Broker",
                },
              ]
            : []
        )
        .concat([
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
        ] as any) as any,
    [createAlert, props.node, isActive, pathName]
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

  return (
    <div className="flex gap-6 flex-col">
      <div className="flex justify-between items-center ">
        <h1>Result: {props.data.length}</h1>
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
