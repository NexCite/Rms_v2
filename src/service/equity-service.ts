"use server";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import { handlerServiceAction } from "@rms/lib/handler";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";

export async function createEquity(
  params: Prisma.EquityUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.equity.create({
        data: {
          config_id,
          to_date: params.to_date,
          description: params.description,
          agent_boxes: { createMany: { data: params.agent_boxes as any } },
          manager_boxes: { createMany: { data: params.manager_boxes as any } },
          expensive_box: { createMany: { data: params.expensive_box as any } },
          adjustment_boxes: {
            createMany: { data: params.adjustment_boxes as any },
          },

          credit_boxes: { createMany: { data: params.credit_boxes as any } },

          p_l: { createMany: { data: params.p_l as any } },
          coverage_boxes: {
            createMany: { data: params.coverage_boxes as any },
          },
        },
      });

      return;
    },
    "Add_Equity",
    true,
    params
  );
}

export async function updateEquity(
  id: number,
  params: Prisma.EquityUncheckedUpdateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.agentBox.deleteMany({
        where: { equity_id: id },
      });
      await prisma.managerBox.deleteMany({
        where: { equity_id: id },
      });
      await prisma.coverageBox.deleteMany({
        where: { equity_id: id },
      });
      await prisma.expensiveBox.deleteMany({
        where: { equity_id: id },
      });
      await prisma.adjustmentBox.deleteMany({
        where: { equity_id: id },
      });
      await prisma.creditBox.deleteMany({
        where: { equity_id: id },
      });

      await prisma.p_LBox.deleteMany({
        where: { equity_id: id },
      });

      await prisma.equity.update({
        where: { id, config_id },
        data: {
          to_date: params.to_date,
          description: params.description,
          agent_boxes: { createMany: { data: params.agent_boxes as any } },
          manager_boxes: { createMany: { data: params.manager_boxes as any } },
          expensive_box: { createMany: { data: params.expensive_box as any } },
          adjustment_boxes: {
            createMany: { data: params.adjustment_boxes as any },
          },

          credit_boxes: { createMany: { data: params.credit_boxes as any } },

          p_l: { createMany: { data: params.p_l as any } },
          coverage_boxes: {
            createMany: { data: params.coverage_boxes as any },
          },
        },
      });

      return;
    },
    "Edit_Equity",
    true,
    params
  );
}

export async function deleteEquityById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      if (info.user.type === "Admin") {
        await prisma.equity.delete({
          where: {
            id,
            config_id,
          },
        });
      }
      return;
    },
    "Delete_Equity",
    true,
    { id }
  );
}
