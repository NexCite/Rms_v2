"use server";
import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createPayment(
  params: Prisma.PaymentCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      params.user = { connect: { id: auth.id } };

      await prisma.payment.create({ data: params });
      return;
    },
    "Add_Payment",
    true,
    props
  );
}

export async function updatePayment(
  id: number,
  params: Prisma.PaymentUpdateInput
): Promise<ServiceActionModel<Prisma.PaymentUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.payment.update({ data: params, where: { id } });
    },
    "Edit_Payment",
    true,
    props
  );
}

export async function deletePaymentById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.payment.delete({ where: { id: id } });
      } else {
        await prisma.payment.update({
          where: { id: id },
          data: { status: "Deleted" },
        });
      }

      return;
    },
    "Delete_Payment",
    true,
    props
  );
}
