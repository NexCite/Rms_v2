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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@rms/components/ui/dropdown-menu";
import { DotsHorizontalIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { deleteMoreDigit, deleteTwoDigit } from "@rms/service/digit-service";
import { deleteCurrency } from "@rms/service/currency-service";
import Authorized from "@rms/components/ui/authorized";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import { DataRoute } from "@rms/config/route-config";
import moment from "moment";

type Props = {
  data: Prisma.LogGetPayload<{ include: { user: true } }>[];
};

export default function LogTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();
  const { push } = useRouter();

  const columns = useMemo<
    ColumnDef<Prisma.LogGetPayload<{ include: { user: true } }>>[]
  >(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        cell({ row: { original } }) {
          return (
            <div
              className={`text-center rounded-md  ${
                original.action === "Add"
                  ? "bg-green-500"
                  : original.action == "Edit"
                  ? "bg-yellow-400"
                  : original.action == "Delete"
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
            >
              {original.id}
            </div>
          );
        },
      },
      { accessorKey: "action", header: "Action" },
      {
        accessorKey: "page",
        header: "Page",
        accessorFn: (e) => {
          if (!e.page) return;
          const url = new URL(e.page);
          return url.pathname;
        },
      },
      { accessorKey: "user.username", header: "Username" },

      {
        accessorKey: "body",
        header: "Body",
        accessorFn: (e) => {
          console.log(e.body);
          return e.body;
        },
      },

      { accessorKey: "error", header: "Error" },

      {
        accessorKey: "create_date",
        header: "Date",
        accessorFn: (e) => moment(e.create_date).fromNow(),
      },
    ],
    [createAlert, isActive, pathName, push]
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
    <div className=" w-full">
      <Card className="h-full w-full overflow-auto flex justify-between">
        <CardHeader
          floated={false}
          shadow={false}
          className="rounded-none mx-10"
        >
          <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <Typography variant="h5" color="blue-gray">
                Recent Transactions
              </Typography>
              <Typography color="gray" className="mt-1 font-normal">
                These are details about the last transactions
              </Typography>
            </div>
            <div className="flex w-full shrink-0 gap-2 md:w-max ">
              <div className="w-full ">
                <Input
                  label="Search"
                  crossOrigin={""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  value={globalFilter}
                  icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                />
              </div>
            </div>
          </div>
        </CardHeader>{" "}
        <table className="w-full min-w-max table-auto text-left">
          <thead className="w-full">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                    key={header.id}
                  >
                    <Typography>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header ??
                              header.column.columnDef.header,
                            header.getContext()
                          )}
                    </Typography>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="p-4 border-b border-blue-gray-50"
                      key={cell.id}
                    >
                      <Typography
                        as={"div"}
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {flexRender(
                          cell.column.columnDef.cell ??
                            cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Typography>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-2">
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
      </Card>
    </div>
  );
}
