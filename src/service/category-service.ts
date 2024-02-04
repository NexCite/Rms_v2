"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@nexcite/lib/handler";
import prisma from "@nexcite/prisma/prisma";
/**
 *
 * Done
 *
 */
export async function createCategory(
  props: Prisma.CategoryUncheckedCreateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      await prisma.category.create({ data: props });
      return;
    },
    "Create_Category",
    {
      update: true,
    }
  );
}

/**
 *
 * Done
 *
 */
export async function updateCategory(
  id: number,
  props: Prisma.CategoryUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      props.user_id = info.user.id;

      return await prisma.category.update({
        where: { id },
        data: props,
      });
    },
    "Update_Category",
    {
      update: true,
    }
  );
}
/**
 *
 * Done
 *
 */

export async function deleteCategoryById(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.category.delete({ where: { id } });
    },
    "Delete_Category",
    { update: true }
  );
}
export async function resetCategory(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.category.update({
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
