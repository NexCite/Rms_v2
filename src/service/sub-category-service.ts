"use server";

import { Category, Prisma, SubCategory } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";

import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createSubCategory(
  props: Prisma.SubCategoryCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      await prisma.subCategory.create({ data: props });
      return;
    },
    "Add_SubCategory",
    true
  );
}

export async function updateSubCategory(
  id: number,
  props: Prisma.SubCategoryUpdateInput
): Promise<ServiceActionModel<Prisma.SubCategoryUpdateInput>> {
  return handlerServiceAction(
    async (auth) => {
      props.user = { connect: { id: auth.id } };

      return await prisma.subCategory.update({
        where: { id },
        data: props,
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
      if (auth.type === "Admin") {
        await prisma.subCategory.delete({ where: { id } });
      } else {
        await prisma.subCategory.update({
          where: { id },
          data: { status: "Deleted", user_id: auth.id },
        });
      }
      return;
    },
    "Delete_SubCategory",
    true
  );
}
