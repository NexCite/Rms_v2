"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

//todo: add user by token

export async function createTrader(
  props: Prisma.TraderUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;
      await prisma.trader.create({ data: props });
      return;
    },
    "Add_Trader",
    true,
    props
  );
}

export async function updateTrader(
  id: number,
  props: Prisma.TraderUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.TraderUpdateInput>> {
  return handlerServiceAction<Prisma.TraderUpdateInput>(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;
      return await prisma.trader.update({
        where: { id },
        data: props,
      });
    },
    "Edit_Trader",
    true,
    props
  );
}

export async function deleteTraderById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (info, config_id) => {
      await prisma.trader.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin")
      //   await prisma.trader.delete({ where: { id: id,config_id } });
      // else
      //   await prisma.trader.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted", user_id: id },
      //   });

      return;
    },
    "Delete_Trader",
    true,
    { id }
  );
}
export async function resetTrader(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.trader.update({
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
