"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

//todo: add user by token

export async function createTrader(
  props: Prisma.TraderCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      props.broker = {
        connect: {
          // @ts-ignore
          id: props.broker_id,
        },
      };

      // @ts-ignore
      delete props.broker_id;

      await prisma.trader.create({ data: props });
      return;
    },
    "Add_Trader",
    true
  );
}

export async function updateTrader(
  id: number,
  props: Prisma.TraderUpdateInput
): Promise<ServiceActionModel<Prisma.TraderUpdateInput>> {
  return handlerServiceAction<Prisma.TraderUpdateInput>(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      return await prisma.trader.update({
        where: { id },
        data: props,
      });
    },
    "Edit_Trader",
    true
  );
}

export async function deleteTraderById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      if (auth.type === "Admin")
        await prisma.trader.delete({ where: { id: id } });
      else
        await prisma.trader.update({
          where: { id: id },
          data: { status: "Deleted", user_id: id },
        });

      return;
    },
    "Delete_Trader",
    true
  );
}
