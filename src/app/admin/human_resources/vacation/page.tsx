import VacationTable from "@rms/widgets/table/vacation-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import moment from "moment";
import { getConfigId } from "@rms/lib/config";
type CommonetType = Prisma.VacationGetPayload<{
  include: {
    employee: {
      select: {
        id: true;
        first_name: true;
        last_name: true;
      };
    };
  };
}>;
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
  const status = props.searchParams.status as
    | "Accepted"
    | "Pending"
    | "Deleted";

  const config_id = await getConfigId();

  const date: [Date, Date] = [
    moment(Number.isNaN(startDate) ? undefined : startDate)
      .startOf("day")
      .toDate(),
    moment(Number.isNaN(endDate) ? undefined : endDate)
      .endOf("day")
      .toDate(),
  ];

  var value: CommonetType[];

  value = await prisma.vacation.findMany({
    where: {
      config_id,
      status: (status || "Pending") as any,
      to_date: {
        lte: date[1],
      },
      from_date: {
        gte: date[0],
      },
    },
    include: {
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
      <VacationTable
        status={status}
        vacations={value}
        date={date}
      ></VacationTable>
    </div>
  );
}
