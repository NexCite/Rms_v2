"use client";

import LoadingButton from "@mui/lab/LoadingButton";
import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Prisma } from "@prisma/client";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { deleteScheduleById } from "@rms/service/schedule-service";
import dayjs from "dayjs";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
type CommonType = Prisma.ScheduleGetPayload<{
  include: {
    attendance: {
      include: {
        employee: {
          select: {
            id: true;
            first_name: true;
            last_name: true;
            email: true;
          };
        };
      };
    };
  };
}>;
type Props = {
  date?: [Date, Date];
  schedule: CommonType[];
};

export default function ScheduleTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const store = useStore();

  const { replace } = useRouter();

  const [selectDate, setSelectDate] = useState<DateRange>({
    from: props.date[0],
    to: props.date[1],
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      setTransition(() => {
        replace(
          pathName +
            `?from_date=${selectDate?.from?.getTime()}&to_date=${selectDate?.to?.getTime()}`,
          {}
        );
      });
    },
    [selectDate, pathName, replace]
  );

  const columns = useMemo<MRT_ColumnDef<CommonType>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ row: { original } }) => (
          <div
            className={`text-center rounded-sm ${
              original.create_date.toLocaleTimeString() !==
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
        accessorKey: "to_date",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "To Date",
        columnDefType: "data",
        accessorFn: ({ to_date }) => dayjs(to_date).format("DD-MM-YYYY"),
      },
    ],
    []
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
          initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
          state={{ showLoadingOverlay: isPadding }}
          enableRowActions
          columns={columns}
          renderRowActionMenuItems={({
            row: {
              original: { to_date, id },
            },
          }) => [
            <Authorized permission="Edit_Schedule" key={1}>
              <Link href={pathName + "/form?id=" + id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  Edit
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="View_Schedule" key={2}>
              <Link href={pathName + "/" + id}>
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
                    `Do You sure you want to delete schedule id:${to_date.toLocaleDateString()} `
                  );
                  if (isConfirm) {
                    setTransition(async () => {
                      const result = await deleteScheduleById(id);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isPadding ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
          data={props.schedule}
        />
      </Card>
    </div>
  );
}
