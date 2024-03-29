import { Prisma } from "@prisma/client";
import { getConfigId } from "@nexcite/lib/config";
import prisma from "@nexcite/prisma/prisma";
import CategoryForm from "@nexcite/widgets/form/category-form";

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
