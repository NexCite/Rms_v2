"use client";

import { Prisma } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Card, CardHeader, Typography } from "@mui/material";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import moment from "moment";

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
  const columns = useMemo<
    MRT_ColumnDef<Prisma.LogGetPayload<{ include: { user: true } }>>[]
  >(
    () => [
      {
        accessorKey: "id",
        header: "Id",
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
    []
  );

  return (
    <div className="w-full">
      <Card>
        <CardHeader
          title={
            <Typography variant="h5" color="blue-gray">
              Recent Logs
            </Typography>
          }
        />

        <MaterialReactTable
          initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
          // state={{ showProgressBars: isPadding }}
          columns={columns}
          data={props.data}
        />
      </Card>
    </div>
  );
}
