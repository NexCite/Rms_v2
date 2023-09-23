import SettingCurrencyTableComponent from "@rms/components/Setting/tables/SettingCurrencyTableComponent";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page() {
  const currencies = await prisma.currency.findMany();
  return (
    <div>
      <SettingCurrencyTableComponent currencies={currencies} />
    </div>
  );
}
