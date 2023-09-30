"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import { hashPassword } from "@rms/lib/hash";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { cookies } from "next/headers";

export async function createInvoice(
  props: Prisma.InvoiceUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      props.user_id = auth.id;

      await prisma.invoice.create({ data: props });
      return;
    },
    "Add_Invoice",
    true,
    props
  );
}

export async function updateInvoice(
  id: number,
  props: Prisma.InvoiceUpdateInput
): Promise<ServiceActionModel<Prisma.InvoiceUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.invoice.update({ data: props, where: { id } });
    },
    "Edit_Invoice",
    true,
    props
  );
}

export async function deleteInvoiceById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.invoice.delete({ where: { id: id } });
      } else {
        await prisma.invoice.update({
          where: { id: id },
          data: { status: "Deleted" },
        });
      }

      return;
    },
    "Delete_Invoice",
    true,
    { id }
  );
}
