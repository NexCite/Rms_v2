"use server";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import { Prisma } from "@prisma/client";

export async function createVacation(
  props: Prisma.VacationUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      await prisma.vacation.create({ data: props });

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
      await prisma.vacation.delete({ where: { id: id } });

      return;
    },
    "Delete_Vacation",
    true,
    { id }
  );
}
