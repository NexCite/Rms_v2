"use client";

import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState, useTransition } from "react";
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

import { Typography } from "@material-tailwind/react";
import moment from "moment";
import { Input } from "@rms/components/ui/input";
import DateRangePicker from "@rms/components/ui/date-range-pciker";
import { DateRange } from "react-day-picker";
import DatePicker from "@rms/components/ui/date-picker";

type Props = {
  data: Prisma.LogGetPayload<{ include: { user: true } }>[];
  date?: Date;
};

export default function LogTable(props: Props) {
  const pathName = usePathname();
  const [date, setDate] = useState<Date>(props.date);
  const { replace } = useRouter();

  const [globalFilter, setGlobalFilter] = useState("");

  const { createAlert } = useAlertHook();

  useEffect(() => {
    if (date !== props.date) {
      replace(`${pathName}?date=${date?.getTime()}`);
    }
  }, [date]);
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
    [createAlert, pathName]
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
    <div className="w-full  flex flex-col gap-10">
      <div className=" ">
        <div className="mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Typography variant="h5" color="blue-gray">
              Recent Logs
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              These are details about the last logs
            </Typography>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-s md:grid-cols-2  lg:grid-cols-2 xl:grid-cols-4 gap-4 m-5">
          <Input
            className="w-full"
            onChange={(e) => setGlobalFilter(e.target.value)}
            value={globalFilter}
            placeholder="search"
          />

          <DatePicker default={date} onChange={setDate} />
        </div>

        <div className="rms-container">
          <div className="rms-table">
            <table className="">
              <thead className="w-full">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
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
          </div>
        </div>
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
      </div>
    </div>
  );
}
