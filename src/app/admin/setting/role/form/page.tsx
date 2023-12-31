import { Prisma } from "@prisma/client";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import RoleForm from "@rms/widgets/form/role-form";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.RoleGetPayload<{}>;
  if (isEditMode) {
    value = await prisma.role.findFirst({ where: { id: id, config_id } });
  }
  return (
    <div>
      <RoleForm value={value} />
    </div>
  );
}
