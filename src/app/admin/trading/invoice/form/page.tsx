import InvoiceForm from "@rms/widgets/form/invoice-form";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page(props: {
  params: { node: "invoice" };
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.InvoiceGetPayload<{ include: { media: true } }>;

  if (isEditMode) {
    value = await prisma.invoice.findUnique({
      include: { media: true },
      where: {
        id,
        // status: user.type === "Admin" ? undefined : "Enable",
      },
    });
  }

  var brokers: Prisma.BrokerGetPayload<{}>[] = await prisma.broker.findMany({
    where: { status: "Enable" },
  });

  var currencies: Prisma.CurrencyGetPayload<{}>[] =
    await prisma.currency.findMany({});

  var accounts: Prisma.AccountGetPayload<{}>[] = await prisma.account.findMany({
    where: { status: "Enable" },
  });

  var subCategories: Prisma.SubCategoryGetPayload<{}>[] =
    await prisma.subCategory.findMany({});

  return (
    <>
      <InvoiceForm
        value={value}
        accounts={accounts}
        currencies={currencies}
        brokers={brokers}
        subCategories={subCategories}
      />
    </>
  );
}
