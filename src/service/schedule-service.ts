"use server";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import { handlerServiceAction } from "@rms/lib/handler";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import moment from "moment";

export async function createSchedule(
  params: Prisma.ScheduleUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      const date = moment(params.to_date);

      const result = await prisma.schedule.findFirst({
        where: {
          config_id,
          to_date: {
            gte: date.startOf("D").toDate(),
            lte: date.endOf("D").toDate(),
          },
        },
      });
      if (result) {
        throw new Error("Schedule already create in this datep");
      }

      const schedule = await prisma.schedule.create({
        data: {
          config_id,
          to_date: date.startOf("D").toDate(),
          // attendance: params.attendance as any,
          attendance: {
            createMany: {
              data: params.attendance as any,
            },
          },
        },
      });

      // params.attendance.createMany.data

      // await prisma.attendance.createMany({
      //   data: params.attendance.
      // })

      return;
    },
    "Add_Schedule",
    true,
    params
  );
}

export async function updateSchedule(
  id: number,
  params: Prisma.ScheduleUncheckedUpdateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      await prisma.attendance.deleteMany({
        where: { schedule_id: id },
      });
      await prisma.schedule.update({
        where: {
          id,
          //  config_id
        },
        data: {
          to_date: params.to_date,
          attendance: { createMany: { data: params.attendance as any } },
        },
      });

      return;
    },
    "Edit_Schedule",
    true,
    params
  );
}

export async function deleteScheduleById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      if (auth.type === "Admin") {
        await prisma.schedule.delete({
          where: {
            id,
            // config_id,
          },
        });
      }
      return;
    },
    "Delete_Schedule",
    true,
    { id }
  );
}
