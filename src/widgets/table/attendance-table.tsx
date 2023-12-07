"use client";

import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";
import { Prisma } from "@prisma/client";
import { useToast } from "@rms/hooks/toast-hook";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Card, CardHeader, Typography } from "@mui/material";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
type CommonType = Prisma.AttendanceGetPayload<{ include: { schedule: true } }>;
type Props = {
  attendance: CommonType[];
};

export default function AttendanceTable(props: Props) {
  const toast = useToast();

  const columns = useMemo<MRT_ColumnDef<CommonType>[] | any>(
    () => [
      {
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Date",
        columnDefType: "data",
        accessorFn: ({ schedule_date }) =>
          dayjs(schedule_date).format("DD-MM-YYYY"),
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Time In-Out",
        columnDefType: "data",
        accessorFn: ({ from_time, to_time }) =>
          `${dayjs(from_time).format("hh:mm A")} - ${dayjs(to_time).format(
            "hh:mm A"
          )}`,
      },
      {
        accessorKey: "hours",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Hours",
        columnDefType: "data",
        accessorFn: ({ hours, minutes }) =>
          `${hours} hour${hours > 1 ? "s" : ""} ${
            !minutes || minutes === 0 ? "" : minutes + " Minutes"
          }`,
      },
      {
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Overtime In-Out",
        columnDefType: "data",
        accessorFn: ({ from_over_time, to_over_time }) =>
          `${dayjs(from_over_time).format("hh:mm A")} - ${dayjs(
            to_over_time
          ).format("hh:mm A")}`,
      },
      {
        accessorKey: "overTimeHours",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Overtime Hours",
        columnDefType: "data",
        accessorFn: ({ overTimeHours, overTimeMinutes }) =>
          `${overTimeHours} hour${overTimeHours > 1 ? "s" : ""} ${
            !overTimeMinutes || overTimeMinutes === 0
              ? ""
              : overTimeMinutes + " Minutes"
          }`,
      },
    ],
    [toast.OpenAlert, , toast]
  );

  return (
    <div className="w-full">
      <Card variant="outlined">
        <CardHeader title={<Typography variant="h5">Attendance</Typography>} />

        <MaterialReactTable
          state={{}}
          columns={columns}
          data={props.attendance}
        />
      </Card>
    </div>
  );
}
