// "use server";

// import { Category } from "@prisma/client";
// import CategoryInterface from "@rms/interfaces/CategoryInterface";
// import { handlerServiceAction } from "@rms/lib/handler";

// import ServiceActionModel from "@rms/models/ServiceActionModel";
// import prisma from "@rms/prisma/prisma";

// export async function createCategory(
//   params: Category
// ): Promise<ServiceActionModel<CategoryInterface>> {
//   return handlerServiceAction<CategoryInterface>(
//     async (auth) => {
//       // params.user = {
//       //   connect: {
//       //     id: auth.user.id,
//       //   },
//       // };
//       var result = (await prisma.category.create({ data: params })) as any;
//       return result;
//     },
//     "category",
//     true
//   );
// }

// export async function updateCategory(
//   id: number,
//   params: CategoryInterface
// ): Promise<ServiceActionModel<CategoryInterface>> {
//   return handlerServiceAction<CategoryInterface>(
//     async (auth) => {
//       var result = (await prisma.category.update({
//         where: { id },
//         data: params as any,
//       })) as any;

//       return result;
//     },
//     "category",
//     true
//   );
// }

// export async function deleteCategoryById(
//   id: number
// ): Promise<ServiceActionModel<void>> {
//   return handlerServiceAction<void>(
//     async (auth) => {
//       if (auth.user.type === "Admin")
//         await prisma.category.delete({ where: { id } });
//       else
//         await prisma.category.update({
//           where: { id },
//         } as any);

//       return;
//     },
//     "category",
//     true
//   );
// }
