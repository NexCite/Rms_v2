"use server";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import { Prisma, Status } from "@prisma/client";
import { copyMediaTemp, deleteMedia } from "./media-service";

export async function createVacation(
  props: Prisma.VacationUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      if (props.media) {
        props.media.create.path = await copyMediaTemp(props.media.create.path);
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
    async (auth, config_id) => {
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
    async (auth, config_id) => {
      if (auth.type === "Admin")
        await prisma.vacation.delete({ where: { id: id, config_id } });
      else
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
