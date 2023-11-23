import UserFormComponent from "@rms/widgets/form/user-form";
import BackButton from "@rms/components/ui/back-button";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";
import { getUserInfo } from "@rms/lib/auth";
import { getUserStatus } from "@rms/service/user-service";

export default async function page(props: {
  params: { node: "user" };
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.UserGetPayload<{
    select: {
      username: true;
      first_name: true;
      last_name: true;
      email: true;
      country: true;
      address1: true;
      role: true;
      phone_number: true;
      address2: true;
      gender: true;
      permissions: true;
      id: true;
    };
  }>;
  const user = await getUserInfo();

  if (isEditMode) {
    value = await prisma.user.findFirst({
      where: {
        id,
        status: user.type === "Admin" ? undefined : "Enable",
        type: user.type === "User" ? "User" : undefined,
        config_id: user.config_id,
      },
      select: {
        username: true,
        first_name: true,
        last_name: true,
        email: true,
        country: true,
        role: true,
        address1: true,
        address2: true,
        phone_number: true,
        gender: true,
        permissions: true,
        id: true,
      },
    });
  }
  const roles = await prisma.role.findMany({});
  return (
    <>
      <UserFormComponent value={value} user={user} roles={roles} />
    </>
  );
}
