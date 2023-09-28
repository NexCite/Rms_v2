"use server";

import { Prisma } from "@prisma/client";
import { getUserInfo } from "@rms/lib/auth";
import { handlerServiceAction } from "@rms/lib/handler";

import { hashPassword } from "@rms/lib/hash";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { cookies } from "next/headers";

export async function createUser(
  params: Prisma.UserCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      params.password = hashPassword(params.password);

      await prisma.user.create({ data: params });
      return;
    },
    "Add_User",
    true
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
  params: Prisma.UserUpdateInput
): Promise<ServiceActionModel<Prisma.UserUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      if (params.password) {
        params.password = hashPassword(params.password.toString());
      }
      if (params.type === "Admin") {
        if (auth.type === "User") {
          params.type = "User";
        }
      }

      return await prisma.user.update({ data: params, where: { id } });
    },
    "Edit_User",
    true
  );
}

export async function deleteUserById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.user.delete({ where: { id: id } });
      } else {
        await prisma.user.update({
          where: { id: id },
          data: { status: "Deleted" },
        });
      }

      return;
    },
    "Delete_User",
    true
  );
}
