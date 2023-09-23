import prisma from "@rms/prisma/prisma";
import CurrencyTable from "@rms/widgets/table/currency-table";
import React from "react";

export default async function page() {
  const currencies = await prisma.currency.findMany({
    orderBy: { create_date: "desc" },
  });
  return (
    <div>
      <CurrencyTable currencies={currencies} />
    </div>
  );
}
