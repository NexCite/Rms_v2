import VacationTable from "@rms/widgets/table/vacation-table";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import dayjs from "dayjs";
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
  const status =
    (props.searchParams.status as "Accepted" | "Pending" | "Deleted") ||
    "Pending";

  const config_id = await getConfigId();

  const date: [Date, Date] = [
    Number.isNaN(startDate)
      ? undefined
      : dayjs(startDate).startOf("day").toDate(),
    Number.isNaN(endDate) ? undefined : dayjs(endDate).endOf("day").toDate(),
  ];

  var value: CommonetType[];

  if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
    value = await prisma.vacation.findMany({
      where: {
        config_id,
        status: (status || "Pending") as any,
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
  } else {
    value = await prisma.vacation.findMany({
      where: {
        config_id,
        status: status || "Pending",
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
  }
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
