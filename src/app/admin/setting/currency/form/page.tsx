import { Prisma } from "@prisma/client";
import BackButton from "@rms/components/ui/back-button";
import prisma from "@rms/prisma/prisma";
import CurrencyForm from "@rms/widgets/form/currency-form";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.CurrencyGetPayload<{}>;
  if (isEditMode) {
    value = await prisma.currency.findUnique({ where: { id: id } });
  }
  return (
    <div>
      <CurrencyForm value={value} />
    </div>
  );
}
