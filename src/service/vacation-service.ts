"use server";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import { copyMediaTemp, deleteMedia } from "./media-service";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import { Prisma } from "@prisma/client";

export async function createVacation(
  props: Prisma.VacationUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (info, config_id) => {
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

      // if (props.media) {
      //   props.media.create.path = await copyMediaTemp(props.media.create.path);
      // }

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
    "Add_Vacation",
    true,
    props
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

    "Edit_Vacation",
    true,
    props
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
    true,
    { id }
  );
}
