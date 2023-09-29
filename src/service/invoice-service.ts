"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import { hashPassword } from "@rms/lib/hash";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { cookies } from "next/headers";

export async function createInvoice(
  params: Prisma.InvoiceUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      params.user_id = auth.id;

      await prisma.invoice.create({ data: params });
      return;
    },
    "Add_Invoice",
    true
  );
}

export async function updateInvoice(
  id: number,
  params: Prisma.InvoiceUpdateInput
): Promise<ServiceActionModel<Prisma.InvoiceUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.invoice.update({ data: params, where: { id } });
    },
    "Edit_Invoice",
    true
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
    true
  );
}
