"use server";

import { Prisma } from "@prisma/client";
import { getUserInfo } from "@rms/lib/auth";
import { handlerServiceAction } from "@rms/lib/handler";

import { hashPassword } from "@rms/lib/hash";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { cookies } from "next/headers";

export async function createUser(
  props: Prisma.UserUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.config_id = config_id;

      props.password = hashPassword(props.password);

      await prisma.user.create({ data: props });
      return;
    },
    "Add_User",
    true,
    props
  );
}

export async function getUserStatus(): Promise<"Enable" | undefined> {
  const user = await getUserInfo();
  return user.type === "Admin" ? undefined : "Enable";
}

export async function getUserType() {
  const user = await getUserInfo();
  return user.type;
}

export async function updateUser(
  id: number,
  props: Prisma.UserUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.UserUpdateInput>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.config_id = config_id;

      if (props.password) {
        props.password = hashPassword(props.password.toString());
      }
      if (props.type === "Admin") {
        if (auth.type === "User") {
          props.type = "User";
        }
      }

      return await prisma.user.update({ data: props, where: { id } });
    },
    "Edit_User",
    true,
    props
  );
}

export async function deleteUserById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      await prisma.user.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.user.delete({ where: { id: id,config_id } });
      // } else {
      //   await prisma.user.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted" },
      //   });
      // }

      return;
    },
    "Delete_User",
    true,
    { id }
  );
}
