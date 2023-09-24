import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import TradingTable from "@rms/widgets/table/trading-table";

export default async function page(props: {
  params: { node: "broker" | "trader" | "account" };
  searchParams: { id?: string };
}) {
  var value:
    | Prisma.AccountGetPayload<{
        include: {
          trader: true;
        };
      }>[]
    | Prisma.BrokerGetPayload<{}>[]
    | Prisma.TraderGetPayload<{
        include: {
          broker: true;
        };
      }>[];

  switch (props.params.node) {
    case "account":
      value = await prisma.account.findMany({
        include: {
          trader: true,
        },
        where: {
          status: "Enable",
        },
      });
      break;

    case "broker":
      value = await prisma.broker.findMany({
        where: {
          status: "Enable",
        },
      });
      break;
    case "trader":
      value = await prisma.trader.findMany({
        include: {
          broker: true,
        },
        where: {
          status: "Enable",
        },
      });
      break;
    default:
      break;
  }

  return (
    <div>
      <TradingTable data={value as any} node={props.params.node} />
    </div>
  );
}
