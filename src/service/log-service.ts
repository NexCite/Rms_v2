"use server";
import { $Enums, Prisma } from "@prisma/client";
import { getConfigId } from "@rms/lib/config";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import moment from "moment";
import { revalidatePath } from "next/cache";

export async function createLog(props: Prisma.LogUncheckedCreateInput) {
  const config_id = await getConfigId();
  props.config_id = config_id;
  await prisma.log.create({ data: props });
  revalidatePath("/admin/setting/log");
}

export async function getLogs(props: {
  user_id?: number;

  date?: Date;
}) {
  return handlerServiceAction(async (auth, config_id) => {
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
              gte: moment(props.date).startOf("day").toDate(),
              lte: moment(props.date).endOf("day").toDate(),
            }
          : undefined,
      },
    });
  }, "View_Log");
}
