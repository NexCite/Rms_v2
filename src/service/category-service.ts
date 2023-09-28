"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createCategory(
  params: Prisma.CategoryCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      await prisma.category.create({ data: params });
      return;
    },
    "Add_Category",
    true
  );
}

export async function updateCategory(
  id: number,
  params: Prisma.CategoryUpdateInput
): Promise<ServiceActionModel<Prisma.CategoryUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.category.update({
        where: { id },
        data: params,
      });
    },
    "Edit_Category",
    true
  );
}

export async function deleteCategoryById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction<void>(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.category.delete({ where: { id } });
      } else {
        await prisma.category.update({
          where: { id },
          data: { status: "Deleted" },
        });
      }

      return;
    },
    "Delete_Category",
    true
  );
}
