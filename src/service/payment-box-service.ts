"use server";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import { handlerServiceAction } from "@rms/lib/handler";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";

export async function createPaymentBox(
  params: Prisma.PaymentBoxUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  console.log(params);
  return handlerServiceAction(
    async (auth, config_id) => {
      await prisma.paymentBox.create({
        data: {
          config_id,
          to_date: params.to_date,
          description: params.description,
          agent_boxes: { createMany: { data: params.agent_boxes as any } },
          manager_boxes: { createMany: { data: params.manager_boxes as any } },
          expensive_box: { createMany: { data: params.expensive_box as any } },
          p_l: { createMany: { data: params.p_l as any } },
          coverage_boxes: {
            createMany: { data: params.coverage_boxes as any },
          },
        },
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
    async (auth, config_id) => {
      await prisma.agentBox.deleteMany({ where: { payment_box_id: id } });
      await prisma.managerBox.deleteMany({ where: { payment_box_id: id } });
      await prisma.coverageBox.deleteMany({ where: { payment_box_id: id } });
      await prisma.expensiveBox.deleteMany({ where: { payment_box_id: id } });
      await prisma.p_LBox.deleteMany({ where: { payment_box_id: id } });

      await prisma.agentBox.createMany({
        data: params.agent_boxes as any,
      });
      await prisma.managerBox.createMany({
        data: params.manager_boxes as any,
      });
      await prisma.coverageBox.createMany({
        data: params.coverage_boxes as any,
      });
      await prisma.expensiveBox.createMany({
        data: params.expensive_box as any,
      });
      await prisma.p_LBox.createMany({
        data: params.p_l as any,
      });

      await prisma.paymentBox.update({
        where: { id, config_id },
        data: {
          to_date: params.to_date,
          description: params.description,
        },
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
    async (auth, config_id) => {
      if (auth.type === "Admin") {
        await prisma.paymentBox.delete({
          where: {
            id,
            config_id,
          },
        });
      }
      return;
    },
    "Delete_Payment_Box",
    true,
    { id }
  );
}
