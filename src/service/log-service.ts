"use server";
import { Prisma } from "@prisma/client";
import { getConfigId } from "@rms/lib/config";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import dayjs from "dayjs";
/**
 *
 * Done
 *
 */
export async function createLog(props: Prisma.LogUncheckedCreateInput) {
  const config_id = await getConfigId();
  props.config_id = config_id;
  await prisma.log.create({ data: props });
}

export async function getLogs(props: {
  user_id?: number;

  date?: Date;
}) {
  return handlerServiceAction(async (info, config_id) => {
    return prisma.log.findMany({
      include: {
        user: true,
      },

      orderBy: { create_date: "desc" },
      where: {
        config_id,
        user_id: props.user_id,
        create_date: props.date
          ? {
              gte: dayjs(props.date).startOf("day").toDate(),
              lte: dayjs(props.date).endOf("day").toDate(),
            }
          : undefined,
      },
    });
  }, "View_Log");
}
