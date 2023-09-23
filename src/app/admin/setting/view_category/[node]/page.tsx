// import { Prisma } from "@prisma/client";
// import CategoryTableComponent from "@rms/components/Setting/tables/CategoryTableComponent";
// import prisma from "@rms/prisma/prisma";

// export default async function page(props: {
//   params: { node: "category" | "sub_category" };
//   searchParams: { id?: string };
// }) {
//   var value: Prisma.CategoryGetPayload<{}>[] | Prisma.CategoryGetPayload<{}>[];

//   switch (props.params.node) {
//     case "category":
//       value = await prisma.category.findMany({});
//       break;

//     case "sub_category":
//       value = await prisma.subCategory.findMany({});
//       break;
//     default:
//       break;
//   }

//   return (
//     <div  >
//       <CategoryTableComponent data={value as any} node={props.params.node} />
//     </div>
//   );
// }
