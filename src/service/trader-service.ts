"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

//todo: add user by token

export async function createTrader(
  params: Prisma.TraderCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      params.broker = {
        connect: {
          // @ts-ignore
          id: params.broker_id,
        },
      };

      // @ts-ignore
      delete params.broker_id;

      await prisma.trader.create({ data: params });
      return;
    },
    "Add_Trader",
    true
  );
}

export async function updateTrader(
  id: number,
  params: Prisma.TraderUpdateInput
): Promise<ServiceActionModel<Prisma.TraderUpdateInput>> {
  return handlerServiceAction<Prisma.TraderUpdateInput>(
    async (auth) => {
      return await prisma.trader.update({
        where: { id },
        data: params,
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
          data: { status: "Deleted" },
        });

      return;
    },
    "Delete_Trader",
    true
  );
}