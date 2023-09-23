// "use server";

// import { Broker, Prisma, Trader } from "@prisma/client";
// import BrokerInterface from "@rms/interfaces/BrokerInterface";
// import { handlerServiceAction } from "@rms/lib/handler";

// import ServiceActionModel from "@rms/models/ServiceActionModel";
// import prisma from "@rms/prisma/prisma";

// //todo: add user by token

// export async function createBroker(
//   params: Prisma.BrokerCreateInput
// ): Promise<ServiceActionModel<BrokerInterface>> {
//   return handlerServiceAction<BrokerInterface>(
//     async (auth) => {
//       params.user = {
//         connect: {
//           id: auth.user.id,
//         },
//       };
//       var result = await prisma.broker.create({ data: params });
//       return result;
//     },
//     "broker",
//     true
//   );
// }

// export async function updateBroker(
//   id: number,
//   params: Prisma.BrokerUpdateInput
// ): Promise<ServiceActionModel<BrokerInterface>> {
//   return handlerServiceAction<BrokerInterface>(
//     async (auth) => {
//       var result = await prisma.broker.update({
//         where: { id },
//         data: params,
//       });

//       return result;
//     },
//     "broker",
//     true
//   );
// }

// export async function deleteBrokerById(
//   id: number
// ): Promise<ServiceActionModel<void>> {
//   return handlerServiceAction<void>(
//     async (auth) => {
//       if (auth.user.type === "Admin")
//         await prisma.broker.delete({ where: { id: id } });
//       else
//         await prisma.broker.update({
//           where: { id: id },
//           data: { status: "Disable" },
//         });

//       return;
//     },
//     "broker",
//     true
//   );
// }
