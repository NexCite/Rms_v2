import { Currency } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import SettingCurrencyFormComponent from "@rms/components/Setting/forms/SettingCurrencyFormComponent";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Currency;
  if (isEditMode) {
    value = await prisma.currency.findUnique({ where: { id: id } });
  }
  return (
    <div>
      <BackButton />
      <SettingCurrencyFormComponent currency={value} />
    </div>
  );
}
