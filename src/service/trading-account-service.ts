"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

//todo: add user by token

export async function createAccount(
  props: Prisma.AccountUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      props.user_id = auth.id;
      await prisma.account.create({ data: props });
      return;
    },
    "Add_Account",
    true,
    props
  );
}

export async function updateAccount(
  id: number,
  props: Prisma.AccountUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.AccountUpdateInput>> {
  return handlerServiceAction<Prisma.AccountUpdateInput>(
    async (auth) => {
      props.user_id = auth.id;

      var result = await prisma.account.update({
        where: { id },
        data: props,
      });

      return result;
    },
    "Edit_Account",
    true,
    props
  );
}

export async function deleteAccountById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      await prisma.account.delete({ where: { id: id } });

      // if (auth.type === "Admin")
      //   await prisma.account.delete({ where: { id: id } });
      // else
      //   await prisma.account.update({
      //     where: { id: id },
      //     data: { status: "Deleted", user_id: auth.id },
      //   });

      return;
    },
    "Delete_Account",
    true,
    { id }
  );
}
