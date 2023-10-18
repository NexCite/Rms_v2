"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

export async function createCurrency(
  props: Prisma.CurrencyUncheckedCreateInput
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.config_id = config_id;
      props.user_id = auth.id;

      await prisma.currency.create({ data: props });
    },
    "Add_Currency",
    true,
    props
  );
}

export async function updateCurrency(
  id: number,
  props: Prisma.CurrencyUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.config_id = config_id;
      props.user_id = auth.id;
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

export async function deleteCurrency(id: number) {
  return handlerServiceAction(
    async (auth, config_id) => {
      return await prisma.currency.delete({ where: { id: id, config_id } });
      // if (auth.type === "Admin") {
      //   await prisma.entry.deleteMany({ where: { currency_id: id } });
      //   await prisma.invoice.deleteMany({ where: { currency_id: id } });
      //   return await prisma.currency.delete({ where: { id: id,config_id } });
      // } else
      //   return await prisma.entry.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted", user_id: auth.id },
      //   });
    },
    "Delete_Currency",
    true,
    { id }
  );
}
