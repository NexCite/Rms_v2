import { Prisma } from "@prisma/client";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import CategoryTable from "@rms/widgets/table/category-table";

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
