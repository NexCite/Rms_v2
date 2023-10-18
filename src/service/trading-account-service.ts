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
    async (auth, config_id) => {
      props.user_id = auth.id;
      props.config_id = config_id;
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
    async (auth, config_id) => {
      props.user_id = auth.id;
      props.config_id = config_id;

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
    async (auth, config_id) => {
      await prisma.account.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin")
      //   await prisma.account.delete({ where: { id: id,config_id } });
      // else
      //   await prisma.account.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted", user_id: auth.id },
      //   });

      return;
    },
    "Delete_Account",
    true,
    { id }
  );
}
