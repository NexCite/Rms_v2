import VacationTable from "@rms/widgets/table/vacation-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import moment from "moment";
import { getConfigId } from "@rms/lib/config";

export default async function page(props: {
  params: {};
  searchParams: {
    from_date?: string;
    to_date?: string;
    status?: string;
  };
}) {
  const startDate = parseInt(props.searchParams.from_date);
  const endDate = parseInt(props.searchParams.to_date);
  const status = props.searchParams.status;

  const config_id = await getConfigId();

  const date: [Date, Date] = [
    moment(Number.isNaN(startDate) ? undefined : startDate)
      .startOf("day")
      .toDate(),
    moment(Number.isNaN(endDate) ? undefined : endDate)
      .endOf("day")
      .toDate(),
  ];

  var value: Prisma.VacationGetPayload<{
    select: {
      id: true;
      to_date: true;
      from_date: true;
      description: true;
      type: true;
      employee: {
        select: {
          id: true;
          first_name: true;
          last_name: true;
        };
      };
      status: true;
    };
  }>[];

  value = await prisma.vacation.findMany({
    where: {
      config_id,
      status: (status || "Pending") as any,
      to_date: {
        gte: date[0],
        lte: date[1],
      },
    },
    select: {
      id: true,
      to_date: true,
      from_date: true,
      description: true,
      status: true,
      type: true,
      employee: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });

  return (
    <div>
      <VacationTable vacations={value} date={date}></VacationTable>
    </div>
  );
}
