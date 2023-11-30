import React from "react";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import { getConfigId } from "@rms/lib/config";
import BackButton from "@rms/components/ui/back-button";
import VacationView from "@rms/widgets/view/vacation-view";
import EmployeeView from "@rms/widgets/view/employee-view";
import moment from "moment";

export default async function page(props: {
  params: { id: string };
  searchParams: {
    from_date?: string;
    to_date?: string;
  };
}) {
  if (props.params.id && !Number.isInteger(+props.params.id)) {
    return (
      <>
        <BackButton />

        <div>Not Found</div>
      </>
    );
  }
  {
    const config_id = await getConfigId();
    const startDate = parseInt(props.searchParams.from_date);
    const endDate = parseInt(props.searchParams.to_date);

    const date: [Date, Date] = [
      Number.isNaN(startDate)
        ? undefined
        : moment(startDate).startOf("day").toDate(),
      Number.isNaN(endDate) ? undefined : moment(endDate).endOf("day").toDate(),
    ];

    var employee: Prisma.EmployeeGetPayload<{}> =
      await prisma.employee.findUnique({
        where: {
          id: +props.params.id,
          config_id,
        },
      });

    var attendances = await prisma.attendance.findMany({
      where: {
        employee_id: +props.params.id,
        schedule: {
          to_date: {
            lte: date[1],
            gte: date[0],
          },
        },
        // to_time: {
        //   lte: date[1],
        // },
        // from_time: {
        //   gte: date[0],
        // },
      },
      include: {
        schedule: true,
      },
    });

    var vacations = await prisma.vacation.findMany({
      where: {
        employee_id: +props.params.id,
        config_id,
        to_date: {
          lte: date[1],
        },
        from_date: {
          gte: date[0],
        },
        status: "Accepted",
      },
    });

    return (
      <>
        <EmployeeView
          date={date}
          attendances={attendances}
          vacations={vacations}
          employee={employee}
        />
      </>
    );
  }
}
