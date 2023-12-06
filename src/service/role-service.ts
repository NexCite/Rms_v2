"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createRole(
  props: Prisma.RoleUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      await prisma.role.create({ data: props });
      return;
    },
    "Add_Role",
    true,
    props
  );
}

export async function updateRole(
  id: number,
  props: Prisma.RoleUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.RoleUpdateInput>> {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;

      return await prisma.role.update({
        where: { id },
        data: props,
      });
    },
    "Edit_Role",
    true,
    props
  );
}

export async function deleteRoleById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (info, config_id) => {
      await prisma.role.delete({ where: { id } });
      // if (auth.type === "Admin") {
      //   await prisma.Role.delete({ where: { id } });
      // } else {
      //   await prisma.Role.update({
      //     where: { id },
      //     data: { status: "Deleted", user_id: info.user.id },
      //   });
      // }

      return;
    },
    "Delete_Role",
    true,
    { id }
  );
}
export async function resetRole(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.role.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}
