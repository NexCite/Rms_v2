import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import moment from "moment";
import ScheduleTable from "@rms/widgets/table/schedule-table";
import { getConfigId } from "@rms/lib/config";

export default async function page(props: {
  params: {};

  searchParams: {
    from_date?: string;
    to_date?: string;
  };
}) {
  const config_id = await getConfigId();

  const startDate = parseInt(props.searchParams.from_date);
  const endDate = parseInt(props.searchParams.to_date);

  const date: [Date, Date] = [
    moment(Number.isNaN(startDate) ? undefined : startDate)
      .startOf("day")
      .toDate(),
    moment(Number.isNaN(endDate) ? undefined : endDate)
      .endOf("day")
      .toDate(),
  ];

  var value: Prisma.ScheduleGetPayload<{
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

  value = await prisma.schedule.findMany({
    where: {
      config_id,
      to_date: {
        gte: date[0],
        lte: date[1],
      },
    },
    select: {
      id: true,
      to_date: true,
      create_date: true,
      modified_date: true,
      attendance: {
        select: {
          id: true,
          absent: true,
          description: true,
          employee: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          from_time: true,
          to_time: true,
          to_over_time: true,
          from_over_time: true,
          schedule_id: true,
        },
      },
    },
  });

  console.log(value);

  return (
    <div>
      <ScheduleTable schedule={value} date={date}></ScheduleTable>
    </div>
  );
}
