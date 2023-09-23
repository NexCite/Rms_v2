// "use server";

// import { Category, Prisma, SubCategory } from "@prisma/client";
// import SubCategoryInterface from "@rms/interfaces/SubCategoryInterface";
// import { handlerServiceAction } from "@rms/lib/handler";

// import ServiceActionModel from "@rms/models/ServiceActionModel";
// import prisma from "@rms/prisma/prisma";

// export async function createSubCategory(
//   params: Prisma.SubCategoryCreateInput
// ): Promise<ServiceActionModel<SubCategoryInterface>> {
//   return handlerServiceAction<SubCategoryInterface>(
//     async (auth) => {
//       params.user = {
//         connect: {
//           id: auth.user.id,
//         },
//       };
//       var result = (await prisma.subCategory.create({ data: params })) as any;
//       return result;
//     },
//     "Add_S",
//     true
//   );
// }

// export async function updateSubCategory(
//   id: number,
//   params: SubCategoryInterface
// ): Promise<ServiceActionModel<SubCategoryInterface>> {
//   return handlerServiceAction<SubCategoryInterface>(
//     async (auth) => {
//       var result = (await prisma.subCategory.update({
//         where: { id },
//         data: params as any,
//       })) as any;

//       return result;
//     },
//     "sub_category",
//     true
//   );
// }

// export async function deleteSubCategoryById(
//   id: number
// ): Promise<ServiceActionModel<void>> {
//   return handlerServiceAction<void>(
//     async (auth) => {
//       if (auth.user.type === "Admin")
//         await prisma.subCategory.delete({ where: { id } });
//       else
//         await prisma.subCategory.update({
//           where: { id },
//         } as any);

//       return;
//     },
//     "sub_category",
//     true
//   );
// }
