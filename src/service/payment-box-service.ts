"use server";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import { handlerServiceAction } from "@rms/lib/handler";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";

export async function createPaymentBox(
  params: Prisma.PaymentBoxUncheckedCreateInput,
  id?: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      if (id) {
        await prisma.paymentBox.delete({ where: { id } });
      }
      await prisma.paymentBox.create({
        data: { to_date: params.to_date, description: params.description },
      });

      await prisma.clientBox.createMany({
        data: params.client_boxes as any,
      });
      await prisma.expensiveBox.createMany({
        data: params.expensive_box as any,
      });
      await prisma.p_LBox.createMany({ data: params.p_l as any });
      await prisma.agentBox.createMany({ data: params.agent_boxes as any });
      await prisma.coverageBox.createMany({
        data: params.coverage_boxes as any,
      });

      return;
    },
    "Add_Payment_Box",
    true,
    params
  );
}

export async function updatePaymentBox(
  id: number,
  params: Prisma.PaymentBoxUncheckedUpdateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      // return await prisma.paymentBox.update({
      //   where: { id },
      //   data: params,
      // });
      await prisma.paymentBox.update({
        where: { id },
        data: { to_date: params.to_date, description: params.description },
      });

      await prisma.clientBox.updateMany({
        data: params.client_boxes as any,
      });
      await prisma.expensiveBox.updateMany({
        data: params.expensive_box as any,
      });
      await prisma.p_LBox.updateMany({ data: params.p_l as any });
      await prisma.agentBox.updateMany({ data: params.agent_boxes as any });
      await prisma.coverageBox.updateMany({
        data: params.coverage_boxes as any,
      });

      return;
    },
    "Edit_Payment_Box",
    true,
    params
  );
}

export async function deletePaymentBoxById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.paymentBox.delete({ where: { id } });
      }
      return;
    },
    "Delete_Payment_Box",
    true,
    { id }
  );
}
