"use server";

import { Category, Prisma, SubCategory } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createSubCategory(
  params: Prisma.SubCategoryCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      await prisma.subCategory.create({ data: params });
      return;
    },
    "Add_SubCategory",
    true
  );
}

export async function updateSubCategory(
  id: number,
  params: Prisma.SubCategoryUpdateInput
): Promise<ServiceActionModel<Prisma.SubCategoryUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.subCategory.update({
        where: { id },
        data: params,
      });
    },
    "Edit_SubCategory",
    true
  );
}

export async function deleteSubCategoryById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      await prisma.subCategory.delete({ where: { id } });
      return;
    },
    "Delete_SubCategory",
    true
  );
}
