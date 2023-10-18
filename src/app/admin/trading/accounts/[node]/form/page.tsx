import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import TradingForm from "@rms/widgets/form/trading-form";

export default async function page(props: {
  params: { node: "broker" | "trader" | "account" };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value:
    | Prisma.AccountGetPayload<{}>
    | Prisma.BrokerGetPayload<{}>
    | Prisma.TraderGetPayload<{}>;

  var relation: {
    traders: Prisma.TraderGetPayload<{}>[];
    currencies: Prisma.CurrencyGetPayload<{}>[];
    brokers: Prisma.BrokerGetPayload<{}>[];
  };

  switch (props.params.node) {
    case "account":
      if (isEditMode) {
        value = await prisma.account.findFirst({
          where: { config_id, id, status: "Enable" },
        });
      }

      const traders = await prisma.trader.findMany({
        where: { config_id, status: "Enable" },
      });

      const currencies = await prisma.currency.findMany({
        where: { config_id },
      });

      relation = {
        traders,
        currencies,
      } as any;

      break;

    case "broker":
      if (isEditMode) {
        value = await prisma.broker.findFirst({
          where: { config_id, id, status: "Enable" },
        });
      }

      break;
    case "trader":
      if (isEditMode) {
        value = await prisma.trader.findFirst({
          where: { config_id, id, status: "Enable" },
        });
      }

      const brokers = await prisma.broker.findMany({
        where: { config_id, status: "Enable" },
      });

      relation = { brokers } as any;

      break;
    default:
      break;
  }

  return (
    <>
      <TradingForm
        relations={relation}
        value={value as any}
        node={props.params.node}
      />
    </>
  );
}
