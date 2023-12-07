"use server";
import { Prisma } from "@prisma/client";
import { FileMapper } from "@rms/lib/common";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import dayjs from "dayjs";

export async function createSchedule(params: {
  to_date?: string | Date;
  attendance?: {
    data: {
      from_time?: string | Date;
      to_time?: string | Date;
      from_over_time?: string | Date;
      to_over_time?: string | Date;
      absent?: boolean;
      description?: string;
      media?: Prisma.MediaUncheckedCreateInput;
      employee_id: number;
      media_id?: number;
    };
    file: FormData;
  }[];
}): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      const date = dayjs(params.to_date);

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
        throw new Error("Schedule already created in this date");
      }
      var index = 0;
      for (var item of params.attendance) {
        if (item.file) {
          item.data.media_id = (
            await FileMapper({
              config_id,
              file: item.file,
              title: item.data.description,
            })
          ).id as any;

          delete item.file;
          delete item.data.media;
        } else if (!item.data.media) {
        }
        params.attendance[index] = item;
        index++;
      }

      await prisma.schedule.create({
        data: {
          config_id,
          to_date: date.startOf("D").toDate(),
          attendance: {
            createMany: {
              data: params.attendance.map((res) => res.data),
            },
          },
        },
      });

      return;
    },
    "Add_Schedule",
    true,
    params
  );
}

export async function updateSchedule(
  id: number,
  params: {
    to_date?: string | Date;
    attendance?: {
      data: {
        from_time?: string | Date;
        to_time?: string | Date;
        from_over_time?: string | Date;
        to_over_time?: string | Date;
        absent?: boolean;
        description?: string;
        media?: Prisma.MediaUncheckedCreateInput;
        media_id?: number;
        employee_id: number;
      };
      file: FormData;
    }[];
  }
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.attendance.deleteMany({
        where: { schedule_id: id },
      });

      var index = 0;
      for (var item of params.attendance) {
        if (item.file) {
          item.data.media_id = (
            await FileMapper({
              config_id,
              file: item.file,
              title: item.data.description,
            })
          ).id as any;

          delete item.file;
          delete item.data.media;
        } else if (!item.data.media) {
        }
        params.attendance[index] = item;
        index++;
      }
      params.attendance = params.attendance.map((res) => {
        res.data.media_id = res.data.media?.id;
        delete res.data.media;

        return res;
      });

      await prisma.schedule.update({
        where: {
          id,
        },
        data: {
          to_date: params.to_date,
          attendance: {
            createMany: {
              data: params.attendance.map((res) => res.data),
            },
          },
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
    async (info, config_id) => {
      if (info.user.type === "Admin") {
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
export async function resetSchedule(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.schedule.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}
