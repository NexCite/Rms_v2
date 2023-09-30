"use server";
import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import { revalidatePath } from "next/cache";

export async function createLog(props: Prisma.LogUncheckedCreateInput) {
  await prisma.log.create({ data: props });
  revalidatePath("/admin/setting/log");
}

export async function getLogs(props: {
  user_id?: number;

  date?: Date;
}) {
  return handlerServiceAction(async (e) => {
    return prisma.log.findMany({
      include: {
        user: true,
      },

      orderBy: { create_date: "desc" },
      where: {
        user_id: props.user_id,
        create_date: props.date
          ? {
              gte: props.date,
              lte: props.date,
            }
          : undefined,
      },
    });
  }, "View_Log");
}
