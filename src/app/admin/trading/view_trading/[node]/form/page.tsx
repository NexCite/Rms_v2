// import { Prisma } from "@prisma/client";
// import BackButton from "@rms/components/ui/back-button";
// import prisma from "@rms/prisma/prisma";

// import React from "react";

// export default async function page(props: {
//   params: { node: "broker" | "trader" | "account" };
//   searchParams: { id?: string };
// }) {
//   const id = +props.searchParams.id;
//   const isEditMode = id ? true : false;
//   var value:
//     | Prisma.AccountGetPayload<{}>
//     | Prisma.BrokerGetPayload<{}>
//     | Prisma.TraderGetPayload<{}>;

//   var relation: {
//     traders: Prisma.TraderGetPayload<{}>[];
//     currencies: Prisma.CurrencyGetPayload<{}>[];
//     brokers: Prisma.BrokerGetPayload<{}>[];
//   };

//   switch (props.params.node) {
//     case "account":
//       if (isEditMode) {
//         value = await prisma.account.findUnique({
//           where: { id, status: "Enable" },
//         });
//       }

//       const traders = await prisma.trader.findMany({
//         where: { status: "Enable" },
//       });

//       const currencies = await prisma.currency.findMany();

//       relation = {
//         traders,
//         currencies,
//       } as any;

//       break;

//     case "broker":
//       if (isEditMode) {
//         value = await prisma.broker.findUnique({
//           where: { id, status: "Enable" },
//         });
//       }

//       break;
//     case "trader":
//       if (isEditMode) {
//         value = await prisma.trader.findUnique({
//           where: { id, status: "Enable" },
//         });
//       }

//       const brokers = await prisma.broker.findMany({
//         where: { status: "Enable" },
//       });

//       relation = { brokers } as any;

//       break;
//     default:
//       break;
//   }

//   return (
//     <>
//       <BackButton />
//       <TradingFormComponent
//         relations={relation as any}
//         value={value as any}
//         node={props.params.node}
//       />
//     </>
//   );
// }
