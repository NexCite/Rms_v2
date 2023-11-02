import ScheduleForm from "@rms/widgets/form/schedule-form";
import { getConfigId } from "@rms/lib/config";
import { getUserInfo } from "@rms/lib/auth";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page(props: {
  params: { node: "employee" };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  const id = +props.searchParams.id;

  const isEditMode = id ? true : false;

  var employees: Prisma.EmployeeGetPayload<{
    select: {
      id: true;
      username: true;
      first_name: true;
      last_name: true;
      attendances: {
        select: {
          id: true;
          from_time: true;
          to_time: true;
          over_time_from: true;
          over_time_to: true;
          media_id: true;
          absent: true;
          description: true;
          media: {
            select: {
              id: true;
              path: true;
            };
          };
        };
      };
    };
  }>[];

  const user = await getUserInfo();

  if (isEditMode) {
    employees = await prisma.employee.findMany({
      where: {
        // id,
        status: user.type === "Admin" ? undefined : "Enable",
        config_id,
      },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
        attendances: {
          where: {
            schedule_id: id,
          },
          select: {
            id: true,
            employee_id: true,
            media_id: true,
            schedule_id: true,
            from_time: true,
            to_time: true,
            over_time_from: true,
            over_time_to: true,
            absent: true,
            description: true,
            media: {
              select: {
                id: true,
                path: true,
              },
            },
          },
        },
      },
    });
  } else {
    employees = (await prisma.employee.findMany({
      where: {
        // id,
        status: user.type === "Admin" ? undefined : "Enable",
        config_id,
      },
      select: {
        id: true,
        username: true,
        first_name: true,
        last_name: true,
      },
    })) as any;
  }

  console.log("employee:", employees[1].attendances);

  return (
    <>
      <ScheduleForm employees={employees} isEditMode={isEditMode} id={id} />
    </>
  );
}
