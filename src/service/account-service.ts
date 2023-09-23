// "use server";

// import { Prisma } from "@prisma/client";
// import AccountInterface from "@rms/interfaces/AccountInterface";
// import { handlerServiceAction } from "@rms/lib/handler";

// import ServiceActionModel from "@rms/models/ServiceActionModel";
// import prisma from "@rms/prisma/prisma";

// //todo: add user by token

// export async function createAccount(
//   params: Prisma.AccountCreateInput
// ): Promise<ServiceActionModel<AccountInterface>> {
//   return handlerServiceAction<AccountInterface>(
//     async (auth) => {
//       params.user = {
//         connect: {
//           id: auth.user.id,
//         },
//       };

//       params.trader = {
//         connect: {
//           // @ts-ignore
//           id: params.trader_id,
//         },
//       };

//       params.currency = {
//         connect: {
//           // @ts-ignore
//           id: params.currency_id,
//         },
//       };

//       // @ts-ignore
//       delete params.currency_id;
//       // @ts-ignore
//       delete params.trader_id;

//       var result = await prisma.account.create({ data: params });
//       return result;
//     },
//     "account",
//     true
//   );
// }

// export async function updateAccount(
//   id: number,
//   params: Prisma.AccountUpdateInput
// ): Promise<ServiceActionModel<AccountInterface>> {
//   return handlerServiceAction<AccountInterface>(
//     async (auth) => {
//       var result = await prisma.account.update({
//         where: { id },
//         data: params,
//       });

//       return result;
//     },
//     "account",
//     true
//   );
// }

// export async function deleteAccountById(
//   id: number
// ): Promise<ServiceActionModel<void>> {
//   return handlerServiceAction<void>(
//     async (auth) => {
//       if (auth.user.type === "Admin")
//         await prisma.account.delete({ where: { id: id } });
//       else
//         await prisma.account.update({
//           where: { id: id },
//           data: { status: "Disable" },
//         });

//       return;
//     },
//     "account",
//     true
//   );
// }
