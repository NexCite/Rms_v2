import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import CurrencyTable from "@rms/widgets/table/currency-table";
import React from "react";

export default async function page() {
  const config_id = await getConfigId();

  const currencies = await prisma.currency.findMany({
    where: { config_id },
    orderBy: { create_date: "desc" },
  });
  return (
    <div>
      <CurrencyTable currencies={currencies} />
    </div>
  );
}
