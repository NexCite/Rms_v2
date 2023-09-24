"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

//todo: add user by token

export async function createAccount(
  params: Prisma.AccountCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      await prisma.account.create({ data: params });
      return;
    },
    "Add_Account",
    true
  );
}

export async function updateAccount(
  id: number,
  params: Prisma.AccountUpdateInput
): Promise<ServiceActionModel<Prisma.AccountUpdateInput>> {
  return handlerServiceAction<Prisma.AccountUpdateInput>(
    async (auth) => {
      var result = await prisma.account.update({
        where: { id },
        data: params,
      });

      return result;
    },
    "Edit_Account",
    true
  );
}

export async function deleteAccountById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      if (auth.type === "Admin")
        await prisma.account.delete({ where: { id: id } });
      else
        await prisma.account.update({
          where: { id: id },
          data: { status: "Deleted" },
        });

      return;
    },
    "Delete_Account",
    true
  );
}
