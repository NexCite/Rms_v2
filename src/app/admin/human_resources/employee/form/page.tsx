import UserFormComponent from "@rms/widgets/form/user-form";
import BackButton from "@rms/components/ui/back-button";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";
import { getUserInfo } from "@rms/lib/auth";
import EmployeeFormComponent from "@rms/widgets/form/employee-form";

export default async function page(props: {
  params: { node: "employee" };
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.EmployeeGetPayload<{
    select: {
      username: true;
      first_name: true;
      last_name: true;
      email: true;
      country: true;
      address1: true;
      phone_number: true;
      address2: true;
      gender: true;
      id: true;
    };
  }>;

  const user = await getUserInfo();

  if (isEditMode) {
    value = await prisma.employee.findFirst({
      where: {
        id,
        status: user.type === "Admin" ? undefined : "Enable",
        config_id: user.config_id,
      },
      select: {
        username: true,
        first_name: true,
        last_name: true,
        email: true,
        country: true,
        address1: true,
        address2: true,
        phone_number: true,
        gender: true,
        id: true,
      },
    });
  }

  return (
    <>
      <EmployeeFormComponent value={value} />
    </>
  );
}
