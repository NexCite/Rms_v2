"use server";

import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";
import { deleteMedia } from "./media-service";
import { FileMapper } from "@rms/lib/common";

export async function createVacation(
  props: {
    employee_id: number;
    file: FormData;
    media: Prisma.MediaUncheckedCreateInput;
    media_id: number;
    description: string;
    to_date: Date;
    from_date: Date;
    type: $Enums.VacationType;
  },
  file: FormData
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      if (file) {
        props.media_id = (
          await FileMapper({
            config_id,
            file: file,
            title: props.description,
          })
        ).id as any;
      }

      delete props.file;
      delete props.media;

      const checkVacation = await prisma.vacation.findMany({
        where: {
          from_date: {
            lte: props.to_date,
          },
          to_date: {
            gte: props.from_date,
          },
          employee_id: props.employee_id,
          status: {
            not: "Deleted",
          },
        },
      });

      if (checkVacation.length > 0) {
        throw new Error(
          "Vacation date is conflicting with an existing date for selected employee"
        );
      }

      await prisma.vacation.create({
        data: {
          config_id,
          type: props.type,
          description: props.description,
          employee_id: props.employee_id,
          from_date: props.from_date,
          to_date: props.to_date,
        },
      });

      return;
    },
    "Create_Vacation",
    {
      update: true,
    }
  );
}

export async function updateVacation(
  id: number,
  props: Prisma.VacationUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      const checkVacation = await prisma.vacation.findMany({
        where: {
          from_date: {
            lte: props.to_date as any,
          },
          to_date: {
            gte: props.from_date as any,
          },
          employee_id: props.employee_id as any,
          status: {
            not: "Deleted",
          },
        },
      });

      if (checkVacation.length > 0) {
        throw new Error(
          "Vacation date is conflicting with an existing date for selected employee"
        );
      }

      const result = await prisma.vacation.findUnique({
        where: { id, config_id },
        include: { media: true },
      });

      if (result) {
        try {
          await deleteMedia(result.media.path);
        } catch (e) {}
      }

      await prisma.vacation.update({
        where: { id },
        data: props,
      });
      return;
    },

    "Update_Vacation",
    {
      update: true,
    }
  );
}

export async function deleteVacationById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.vacation.update({
        where: { id: id, config_id },
        data: { status: "Deleted" },
      });

      return;
    },
    "Delete_Vacation",
    { update: true }
  );
}
export async function resetVaction(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.vacation.update({
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
