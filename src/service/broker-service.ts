"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import prisma from "@rms/prisma/prisma";

export async function createBroker(props: Prisma.BrokerUncheckedCreateInput) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      await prisma.broker.create({ data: props });
      return;
    },
    "Create_Broker",
    {
      update: true,
    }
  );
}

export async function updateBroker(
  id: number,
  props: Prisma.BrokerUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      return await prisma.broker.update({
        where: { id },
        data: props,
      });
    },
    "Update_Broker",
    {
      update: true,
    }
  );
}

export async function deleteBrokerById(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.broker.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin")
      //   await prisma.broker.delete({ where: { id: id,config_id } });
      // else
      //   await prisma.broker.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted", user_id: info.user.id },
      //   });

      return;
    },
    "Delete_Broker",
    { update: true }
  );
}
export async function resetBroker(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.broker.update({
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
