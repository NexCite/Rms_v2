import PaymentForm from "@rms/widgets/form/payment-form";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page(props: {
  params: { node: "payment" };
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;
  var value: Prisma.PaymentGetPayload<{
    include: { media: true };
  }>;

  if (isEditMode) {
    value = await prisma.payment.findUnique({
      include: { media: true },
      where: {
        id,
        // status: user.type === "Admin" ? undefined : "Enable",
      },
    });
  }

  var invoices: Prisma.InvoiceGetPayload<{}>[] = await prisma.invoice.findMany({
    where: { status: "Enable" },
  });

  return (
    <>
      <PaymentForm value={value} invoices={invoices} />
    </>
  );
}
