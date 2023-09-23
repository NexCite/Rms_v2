import UserFormComponent from "@rms/widgets/form/user-form";
import BackButton from "@rms/components/ui/back-button";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";
import { getUserInfo } from "@rms/lib/auth";

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
      phone_number: true;
      address2: true;
      gender: true;
      permissions: true;
      id: true;
    };
  }>;

  if (isEditMode) {
    const user = await getUserInfo();

    value = await prisma.user.findUnique({
      where: {
        id,
        status: user.type === "Admin" ? undefined : "Enable",
        type: user.type === "Admin" ? undefined : "User",
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
        permissions: true,
        id: true,
      },
    });
  }

  return (
    <>
      <BackButton />
      <UserFormComponent value={value} />
    </>
  );
}
