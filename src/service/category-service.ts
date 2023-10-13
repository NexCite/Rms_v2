"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createCategory(
  props: Prisma.CategoryUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      await prisma.category.create({ data: props });
      return;
    },
    "Add_Category",
    true,
    props
  );
}

export async function updateCategory(
  id: number,
  props: Prisma.CategoryUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.CategoryUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.category.update({
        where: { id },
        data: props,
      });
    },
    "Edit_Category",
    true,
    props
  );
}

export async function deleteCategoryById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      await prisma.category.delete({ where: { id } });
      // if (auth.type === "Admin") {
      //   await prisma.category.delete({ where: { id } });
      // } else {
      //   await prisma.category.update({
      //     where: { id },
      //     data: { status: "Deleted", user_id: auth.id },
      //   });
      // }

      return;
    },
    "Delete_Category",
    true,
    { id }
  );
}
