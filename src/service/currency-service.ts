"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

/**
 *
 * Done
 *
 */
export async function createCurrency(
  props: Prisma.CurrencyUncheckedCreateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      await prisma.currency.create({ data: props });
    },
    "Add_Currency",
    true,
    props
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
    "Edit_Currency",
    true,
    props
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
    true,
    { id }
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
    true
  );
}
