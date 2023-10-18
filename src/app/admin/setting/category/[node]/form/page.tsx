import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import CategoryForm from "@rms/widgets/form/category-form";
import React from "react";

export default async function page(props: {
  params: { node: "category" | "sub_category" };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.CategoryGetPayload<{}> | Prisma.SubCategoryGetPayload<{}>;

  var relation: Prisma.CategoryGetPayload<{}>[];

  switch (props.params.node) {
    case "sub_category":
      if (isEditMode) {
        value = await prisma.subCategory.findFirst({
          where: { id: id, config_id },
        });
      }

      relation = await prisma.category.findMany({ where: { config_id } });

      break;

    case "category":
      if (isEditMode) {
        value = await prisma.category.findFirst({
          where: { id, config_id },
        });
      }

      break;
    default:
      break;
  }

  return (
    <>
      <CategoryForm
        relations={relation}
        value={value as any}
        node={props.params.node}
      />
    </>
  );
}
