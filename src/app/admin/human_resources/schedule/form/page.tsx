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

  const scheduleConfig = await prisma.scheduleConfig.findFirst({
    where: { config_id },
  });

  const user = await getUserInfo();
  const schedule = isEditMode
    ? await prisma.schedule.findUnique({
        where: { id, config_id },
        include: {
          attendance: { include: { employee: true, media: true } },
        },
      })
    : undefined;

  const employees = (await prisma.employee.findMany({
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

  const vactions = await prisma.vacation.findMany({
    where: {
      to_date: {
        gte: new Date(),
      },
      config_id,
    },
  });

  return (
    <>
      <ScheduleForm
        schedule={schedule}
        vactions={vactions}
        scheduleConfig={scheduleConfig}
        employees={employees}
        isEditMode={isEditMode}
        id={id}
      />
    </>
  );
}
