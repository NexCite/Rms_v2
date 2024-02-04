"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@nexcite/lib/handler";

import ServiceActionModel from "@nexcite/models/ServiceActionModel";
import prisma from "@nexcite/prisma/prisma";

//todo: add user by token

export async function createAccount(
  props: Prisma.AccountUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;
      await prisma.account.create({ data: props });
      return;
    },
    "Create_Account",
    {
      update: true,
    }
  );
}

export async function updateAccount(
  id: number,
  props: Prisma.AccountUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.AccountUpdateInput>> {
  return handlerServiceAction<Prisma.AccountUpdateInput>(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;

      var result = await prisma.account.update({
        where: { id },
        data: props,
      });

      return result;
    },
    "Update_Account",
    {
      update: true,
    }
  );
}

export async function deleteAccountById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (info, config_id) => {
      await prisma.account.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin")
      //   await prisma.account.delete({ where: { id: id,config_id } });
      // else
      //   await prisma.account.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted", user_id: info.user.id },
      //   });

      return;
    },
    "Delete_Account",
    { update: true }
  );
}
export async function resetTraderAccount(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.account.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    {
      update: true,
    }
  );
}
