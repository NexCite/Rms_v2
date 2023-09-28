import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import CategoryTable from "@rms/widgets/table/category-table";

export default async function page(props: {
  params: { node: "category" | "sub_category" };
  searchParams: { id?: string };
}) {
  var value: Prisma.CategoryGetPayload<{}>[] | Prisma.CategoryGetPayload<{}>[];

  switch (props.params.node) {
    case "category":
      value = await prisma.category.findMany({
        orderBy: { modified_date: "desc" },
      });
      break;

    case "sub_category":
      value = await prisma.subCategory.findMany({
        orderBy: { modified_date: "desc" },
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
