"use client";

import { Prisma } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader, Typography } from "@mui/material";
import {
  MRT_ColumnDef,
  MRT_ColumnFiltersState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import dayjs from "dayjs";
import useHistoryStore from "@rms/hooks/history-hook";

type Props = {
  data: Prisma.LogGetPayload<{ include: { user: true } }>[];
  date?: Date;
};

export default function LogTable(props: Props) {
  const pathName = usePathname();
  const [date, setDate] = useState<Date>(props.date);
  const { replace } = useRouter();

  useEffect(() => {
    if (date !== props.date) {
      replace(`${pathName}?date=${date?.getTime()}`);
    }
  }, [date, pathName, replace, props.date]);
  const table = useMaterialReactTable({
    columns,
    data: props.data,
    enableRowActions: true,

    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
    enableRowSelection: true,
    enableSelectAll: true,
    editDisplayMode: "row",

    initialState: {
      density: "comfortable",

      columnVisibility: {},
    },
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title={
          <Typography variant="h5" color="blue-gray">
            Recent Logs
          </Typography>
        }
      />

      <MaterialReactTable table={table} />
    </Card>
  );
}

const columnHelper =
  createMRTColumnHelper<
    Prisma.LogGetPayload<{ include: { user: { select: { username: true } } } }>
  >();
const columns = [
  columnHelper.accessor(
    (row) => (
      <span
        className={`text-center rounded-md  ${
          row.action === "Add"
            ? "bg-green-500"
            : row.action == "Edit"
            ? "bg-yellow-400"
            : row.action == "Delete"
            ? "bg-red-500"
            : "bg-blue-500"
        }`}
      >
        {row.id}
      </span>
    ),
    {
      header: "Id",
      id: "id",
      Cell({ row: { original } }) {
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
    }
  ),
  columnHelper.accessor("action", { header: "Action" }),
  columnHelper.accessor(
    (e) => {
      if (!e.page) return;
      const url = new URL(e.page);
      return url.pathname;
    },
    {
      header: "Page",
      id: "page",
    }
  ),

  columnHelper.accessor("user.username", { header: "Username" }),

  columnHelper.accessor(
    (row) => {
      return <div>{row.body}</div>;
    },
    { header: "Data", id: "body" }
  ),

  columnHelper.accessor(
    (row) => {
      return <div>{row.body}</div>;
    },
    { header: "Error", id: "error" }
  ),

  columnHelper.accessor(
    (row) => dayjs(new Date(row.create_date)).format("MMMM-DD-YYYY hh:mm a"),
    {
      id: "create_date",
      header: "Date",
    }
  ),
];
