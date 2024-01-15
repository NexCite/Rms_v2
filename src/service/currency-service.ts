"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

/**
 *
 * Done
 *
 */

export async function findCurrenciesService() {
  return handlerServiceAction(async (user, config_id) => {
    return await prisma.currency.findMany({
      where: { config_id: config_id },
    });
  }, "View_Currencies");
}

export async function createCurrency(
  props: Prisma.CurrencyUncheckedCreateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      return await prisma.currency.create({ data: props });
    },
    "Create_Currency",
    {
      update: true,
      body: props,
    }
  );
}

/**
 *
 * Done
 *
 */
export async function updateCurrency(
  id: number,
  props: Prisma.CurrencyUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;
      await prisma.currency.update({
        where: { id: id },
        data: props,
      });
    },
    "Update_Currency",
    {
      update: true,
      body: props,
    }
  );
}

/**
 *
 * Done
 *
 */
export async function deleteCurrency(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      return await prisma.currency.delete({ where: { id: id, config_id } });
    },
    "Delete_Currency",
    { update: true }
  );
}
export async function resetCurrency(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.currency.update({
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
      body: { id: id },
    }
  );
}
