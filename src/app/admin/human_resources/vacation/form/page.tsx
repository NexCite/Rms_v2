import VacationForm from "@rms/widgets/form/vacation-form";
import { getUserInfo } from "@rms/lib/auth";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page(props: {
  params: { node: "vacation" };
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var employees: Prisma.EmployeeGetPayload<{
    select: {
      first_name: true;
      last_name: true;
      id: true;
    };
  }>[];

  var value: Prisma.VacationGetPayload<{
    include: { media: true };
  }>;

  const user = await getUserInfo();
  employees = await prisma.employee.findMany({
    where: {
      status: user.type === "Admin" ? undefined : "Enable",
      config_id: user.config_id,
    },
    select: {
      first_name: true,
      last_name: true,
      id: true,
    },
  });

  if (isEditMode) {
    value = await prisma.vacation.findFirst({
      where: {
        id,
      },
      include: {
        media: true,
      },
    });
  }

  return (
    <>
      <VacationForm
        id={id}
        isEditMode={isEditMode}
        value={value}
        employees={employees}
      />
    </>
  );
}
