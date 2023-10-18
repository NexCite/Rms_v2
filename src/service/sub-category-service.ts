"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import ServiceActionModel from "@rms/models/ServiceActionModel";
import prisma from "@rms/prisma/prisma";

export async function createSubCategory(
  props: Prisma.SubCategoryUncheckedCreateInput
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.config_id = config_id;
      props.user_id = auth.id;

      await prisma.subCategory.create({ data: props });
      return;
    },
    "Add_SubCategory",
    true,
    props
  );
}

export async function updateSubCategory(
  id: number,
  props: Prisma.SubCategoryUncheckedUpdateInput
): Promise<ServiceActionModel<Prisma.SubCategoryUpdateInput>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.config_id = config_id;
      props.user_id = auth.id;
      return await prisma.subCategory.update({
        where: { id },
        data: props,
      });
    },
    "Edit_SubCategory",
    true,
    props
  );
}

export async function deleteSubCategoryById(
  id: number
): Promise<ServiceActionModel<void>> {
  return handlerServiceAction(
    async (auth, config_id) => {
      await prisma.subCategory.delete({ where: { id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.subCategory.delete({ where: { id } });
      // } else {
      //   await prisma.subCategory.update({
      //     where: { id },
      //     data: { status: "Deleted", user_id: auth.id },
      //   });
      // }
      return;
    },
    "Delete_SubCategory",
    true,
    { id }
  );
}
