"use client";
import Authorized from "@rms/components/ui/authorized";
import { Prisma } from "@prisma/client";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React, { useCallback, useMemo, useState, useTransition } from "react";
import {
  CardContent,
  CardHeader,
  Typography,
  Button,
  Card,
  Divider,
  Autocomplete,
  TextField,
} from "@mui/material";
import dayjs from "dayjs";
import CountCard from "../common/count-card";
import AttendanceTable from "../table/attendance-table";
import LoadingButton from "@mui/lab/LoadingButton";
import { usePathname, useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";

interface Props {
  employee: Prisma.EmployeeGetPayload<{}>;
  attendances: Prisma.AttendanceGetPayload<{ include: { schedule: true } }>[];
  vacations: Prisma.VacationGetPayload<{}>[];
  date: [Date, Date];
}

export default function EmployeeView(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();

  const [totalMinutes, setTotalMinutes] = useState({
    normal: 0,
    overtime: 0,
  });

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

  const calculatedAttendances = useMemo(() => {
    let totalOvertimeMinutes = 0;
    let totalMinutes = 0;

    const array = props.attendances?.map((element) => {
      // calculate from - to time
      const toTime = dayjs(element.to_time);
      const fromTime = dayjs(element.from_time);

      const hours = toTime.diff(fromTime, "hours");
      let minutes = toTime.diff(fromTime, "minutes");

      totalMinutes += toTime.diff(fromTime, "minute");

      minutes = minutes - hours * 60;

      // calculate from - to overtime
      const toOverTime = dayjs(element.to_over_time);
      const fromOverTime = dayjs(element.from_over_time);

      const overTimeHours = toOverTime.diff(fromOverTime, "hour");
      let overTimeMinutes = toOverTime.diff(fromOverTime, "minute");

      totalOvertimeMinutes += toOverTime.diff(fromOverTime, "minute");

      overTimeMinutes = overTimeMinutes - overTimeHours * 60;

      return {
        ...element,
        hours,
        minutes,
        schedule_date: element.schedule.to_date,
        overTimeHours,
        overTimeMinutes,
      };
    });

    setTotalMinutes({
      overtime: totalOvertimeMinutes,
      normal: totalMinutes,
    });

    console.log(array);

    return array;
  }, [props.attendances]);

  return (
    <Card className=" m-auto">
      <CardHeader
        title={
          <Typography variant="h5">
            {`${props.employee.first_name} ${props.employee.last_name}`}{" "}
            {/* <span
              className={
                props.employee.status === "Deleted"
                  ? "bg-red-500"
                  : props.employee.status === "Accepted"
                  ? "bg-green-500"
                  : "bg-blue-500"
              }
              style={{
                fontSize: 14,
                borderRadius: 5,
                userSelect: "none",
                padding: "4px 6px",
                color: "white",
              }}
            >
              {props.employee.status}
            </span> */}
          </Typography>
        }
      />

      <CardContent className="">
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

        <div className="flex gap-4">
          <CountCard
            label="Hours Worked"
            count={(() => {
              const hours = Math.floor(totalMinutes.normal / 60);
              const minutes = totalMinutes.normal - hours * 60;

              return `${hours} Hour${hours > 1 ? "s" : ""} ${
                !minutes || minutes === 0 ? "" : minutes + " Minutes"
              }`;
            })()}
          />
          <CountCard
            label="Overtime Hours"
            count={(() => {
              const hours = Math.floor(totalMinutes.overtime / 60);
              const minutes = totalMinutes.overtime - hours * 60;

              return `${hours} Hour${hours > 1 ? "s" : ""} ${
                !minutes || minutes === 0 ? "" : minutes + " Minutes"
              }`;
            })()}
          />
          <CountCard
            label="Total Vacations"
            count={props.vacations?.length || 0}
          />
        </div>

        <Divider className="mt-8 mb-8" />

        <div>
          <AttendanceTable attendance={calculatedAttendances} />
          {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              slotProps={{ textField: { size: "small" } }}
              label="From Date"
              defaultValue={dayjs(selectDate.from)}
              views={["month"]}
              onChange={(e) => {
                setSelectDate((prev) => ({ ...prev, from: e?.toDate() }));
              }}
            />
          </LocalizationProvider> */}
        </div>
      </CardContent>
    </Card>
  );
}
