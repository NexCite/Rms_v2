"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

export async function createCurrency(props: Prisma.CurrencyCreateInput) {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };
      await prisma.currency.create({ data: props });
    },
    "Add_Currency",
    true
  );
}

export async function updateCurrency(
  id: number,
  props: Prisma.CurrencyUpdateInput
) {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };
      await prisma.currency.update({ where: { id: id }, data: props });
    },
    "Edit_Currency",
    true
  );
}

export async function deleteCurrency(id: number) {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.entry.deleteMany({ where: { currency_id: id } });
        await prisma.invoice.deleteMany({ where: { currency_id: id } });
        return await prisma.currency.delete({ where: { id: id } });
      } else
        return await prisma.entry.update({
          where: { id: id },
          data: { status: "Deleted" },
        });
    },
    "Delete_Currency",
    true
  );
}
