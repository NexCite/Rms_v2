import PaymentForm from "@rms/widgets/form/payment-form";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";
import { getConfigId } from "@rms/lib/config";

export default async function page(props: {
  params: { node: "payment" };
  searchParams: { id?: string };
}) {
  const config_id = await getConfigId();

  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.PaymentGetPayload<{
    include: { media: true };
  }>;

  if (isEditMode) {
    value = await prisma.payment.findFirst({
      include: { media: true },
      where: {
        config_id,
        id,
        // status: user.type === "Admin" ? undefined : "Enable",
      },
    });
  }

  var invoices: Prisma.InvoiceGetPayload<{}>[] = await prisma.invoice.findMany({
    where: { config_id, status: "Enable" },
  });

  return (
    <>
      <PaymentForm value={value} invoices={invoices} />
    </>
  );
}
