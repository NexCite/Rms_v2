"use server";
import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@nexcite/lib/handler";
import ServiceActionModel from "@nexcite/models/ServiceActionModel";
import prisma from "@nexcite/prisma/prisma";

export async function findEquityById(id: number) {
  return handlerServiceAction(async (info, config_id) => {
    return await prisma.equity.findFirst({
      where: {
        id,
        config_id,
      },
    });
  }, "View_Equity");
}

export async function findEquities(props: { from: Date; to: Date }) {
  return handlerServiceAction(async (info, config_id) => {
    return await prisma.equity.findMany({
      include: {
        adjustment_boxes: true,
        agent_boxes: true,
        coverage_boxes: true,
        expensive_box: true,
        manager_boxes: true,
        p_l: true,
        credit_boxes: true,
      },
      orderBy: { to_date: "desc" },

      where: {
        config_id,
        to_date: {
          gte: props.from,
          lte: props.to,
        },
      },
    });
  }, "View_Equities");
}
/**
 *
 * Done
 *
 */
export async function createEquity(params: Prisma.EquityUncheckedCreateInput) {
  return handlerServiceAction(
    async (info, config_id) => {
      return await prisma.equity.create({
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

          // credit_boxes: { createMany: { data: params.credit_boxes as any } },

          p_l: { createMany: { data: params.p_l as any } },
          coverage_boxes: {
            createMany: { data: params.coverage_boxes as any },
          },
        },
      });

      return;
    },
    "Create_Equity",
    { update: true }
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

          // credit_boxes: { createMany: { data: params.credit_boxes as any } },

          p_l: { createMany: { data: params.p_l as any } },
          coverage_boxes: {
            createMany: { data: params.coverage_boxes as any },
          },
        },
      });

      return;
    },
    "Update_Equity",
    { update: true }
  );
}

/**
 *
 * Done
 *
 */
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
    { update: true }
  );
}
export async function resetEquity(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.equity.update({
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
    }
  );
}
