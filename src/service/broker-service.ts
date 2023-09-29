"use server";

import { Broker, Prisma, Trader } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

//todo: add user by token

export async function createBroker(
  props: Prisma.BrokerCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      await prisma.broker.create({ data: props });
      return;
    },
    "Add_Broker",
    true
  );
}

export async function updateBroker(
  id: number,
  props: Prisma.BrokerUpdateInput
): Promise<ServiceActionModel<Prisma.BrokerUpdateInput>> {
  return handlerServiceAction<Prisma.BrokerUpdateInput>(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      return await prisma.broker.update({
        where: { id },
        data: props,
      });
    },
    "Edit_Broker",
    true
  );
}

export async function deleteBrokerById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      if (auth.type === "Admin")
        await prisma.broker.delete({ where: { id: id } });
      else
        await prisma.broker.update({
          where: { id: id },
          data: { status: "Deleted", user_id: auth.id },
        });

      return;
    },
    "Delete_Broker",
    true
  );
}
