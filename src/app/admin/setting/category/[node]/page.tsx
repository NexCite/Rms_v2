import { Prisma } from "@prisma/client";
import { getConfigId } from "@nexcite/lib/config";
import prisma from "@nexcite/prisma/prisma";
import CategoryTable from "@nexcite/widgets/table/category-table";

export default async function page(props: {
  params: { node: "category" | "sub_category" };
  searchParams: { id?: string };
}) {
  var value: Prisma.CategoryGetPayload<{}>[] | Prisma.CategoryGetPayload<{}>[];
  const config_id = await getConfigId();

  switch (props.params.node) {
    case "category":
      value = await prisma.category.findMany({
        where: { config_id },
        orderBy: { id: "desc" },
      });
      break;

    case "sub_category":
      value = await prisma.subCategory.findMany({
        where: { config_id },
        orderBy: { id: "desc" },
      });
      break;
    default:
      break;
  }

  return (
    <div>
      <CategoryTable data={value as any} node={props.params.node} />
    </div>
  );
}
