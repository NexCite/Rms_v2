"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import styled from "@emotion/styled";
import { Prisma } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { useRouter } from "next/navigation";
import { deleteScheduleById } from "@rms/service/schedule-service";
import LoadingButton from "@mui/lab/LoadingButton";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { DateRange } from "react-day-picker";
import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";

type Props = {
  date?: [Date, Date];
  schedule: Prisma.ScheduleGetPayload<{
    select: {
      id: true;
      to_date: true;
      create_date: true;
      modified_date: true;
      attendance: {
        select: {
          id: true;
          absent: true;
          description: true;
          employee: {
            select: {
              id: true;
              first_name: true;
              last_name: true;
              email: true;
            };
          };
          from_time: true;
          to_time: true;
          to_over_time: true;
          from_over_time: true;
          schedule_id: true;
        };
      };
    };
  }>[];
};

export default function ScheduleTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setIsPadding] = useTransition();
  const [padding, setPadding] = useTransition();

  const [globalFilter, setGlobalFilter] = useState("");

  const store = useStore();

  const { push, replace } = useRouter();

  const [selectDate, setSelectDate] = useState<DateRange>({
    from: props.date[0],
    to: props.date[1],
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setIsPadding(() => {
        replace(
          pathName +
            `?from_date=${selectDate?.from?.getTime()}&to_date=${selectDate?.to?.getTime()}`,
          {}
        );
      });
    },
    [selectDate, pathName, replace]
  );

  const attendances = useMemo(() => {
    let list = [];
    console.log(props);

    props.schedule.map((element) => {
      list = list.concat(element.attendance);
    });

    return list;
  }, [props]);

  const columns = useMemo<
    MRT_ColumnDef<
      Prisma.AttendanceGetPayload<{
        select: {
          id: true;
          absent: true;
          description: true;
          employee: {
            select: {
              id: true;
              first_name: true;
              last_name: true;
              email: true;
            };
          };
          from_time: true;
          to_time: true;
          from_over_time: true;
          to_over_time;
          schedule_id: true;
        };
      }>
    >[]
  >(
    () => [
      {
        accessorKey: "id",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Schedule ID",
        accessorFn: (p) => p.schedule_id,
      },
      {
        accessorKey: "employee",
        header: "Employee",
        columnDefType: "data",
        id: "employee",
        accessorFn: (p) => p.employee.first_name + p.employee.last_name,
      },
      {
        header: "Absent",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ row: { original } }) => original.absent && <span>✅</span>,
      },
      {
        accessorKey: "from_time",
        header: "In Time",
        columnDefType: "data",
        id: "from_time",
        accessorFn: (p) => p.from_time?.toLocaleDateString(),
      },
      {
        accessorKey: "to_time",
        header: "Out Time",
        columnDefType: "data",
        id: "to_time",
        accessorFn: (p) => p.to_time?.toLocaleDateString(),
      },
      {
        accessorKey: "from_over_time",
        header: "Overtime In",
        columnDefType: "data",
        id: "from_over_time",
        accessorFn: (p) => p.from_over_time?.toLocaleDateString(),
      },
      {
        accessorKey: "to_over_time",
        header: "Overtime Out",
        columnDefType: "data",
        id: "to_over_time",
        accessorFn: (p) => {
          return p.to_over_time?.toLocaleDateString();
        },
      },
      {
        accessorKey: "description",
        header: "Description",
      },
    ],
    [store.OpenAlert, , store]
  );

  return (
    <div className="w-full">
      <Card>
        <CardHeader
          title={<Typography variant="h5">Schedule Table</Typography>}
        />

        <form
          className=" grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4  h-full  overflow-auto  justify-between rms-container p-5"
          onSubmit={handleSubmit}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              label="From Date"
              defaultValue={dayjs(selectDate.from)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, from: e?.toDate() }));
              }}
            />
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              label="To Date"
              defaultValue={dayjs(selectDate.to)}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, to: e?.toDate() }));
              }}
            />
          </LocalizationProvider>

          <LoadingButton
            variant="contained"
            className="hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white"
            disableElevation
            loadingIndicator="Loading…"
            loading={isPadding}
            type="submit"
          >
            Search
          </LoadingButton>
        </form>

        <MaterialReactTable
          state={{ showProgressBars: isPadding }}
          enableRowActions
          columns={columns as any}
          renderRowActionMenuItems={({
            row: {
              original: { schedule_id },
            },
          }) => [
            <Authorized permission="Edit_Schedule" key={1}>
              <Link href={pathName + "/form?id=" + schedule_id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  Edit
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="View_Schedule" key={2}>
              <Link href={pathName + "/" + schedule_id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  View
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="Delete_Schedule" key={3}>
              <MenuItem
                disabled={isPadding}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete schedule id:${schedule_id} `
                  );
                  if (isConfirm) {
                    setPadding(async () => {
                      const result = await deleteScheduleById(schedule_id);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isPadding ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
          data={attendances}
        />
      </Card>
    </div>
  );
}
const Style = styled.div``;
