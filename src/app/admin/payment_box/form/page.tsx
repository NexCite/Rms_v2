import PaymentBoxForm from "@rms/widgets/form/payment-box-form";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";
import { getConfigId } from "@rms/lib/config";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;

  var value: Prisma.PaymentBoxGetPayload<{
    select: {
      agent_boxes: true;
      client_boxes: true;
      p_l: true;
      coverage_boxes: true;
      expensive_box: true;
      to_date: true;
      description: true;
    };
  }>;

  var paymentBoxes: Prisma.PaymentBoxGetPayload<{}>[];

  const config_id = await getConfigId();

  if (isEditMode) {
    value = await prisma.paymentBox.findFirst({
      where: { config_id, id },
      select: {
        agent_boxes: true,
        client_boxes: true,
        p_l: true,
        coverage_boxes: true,
        expensive_box: true,
        to_date: true,
        description: true,
      },
    });

    paymentBoxes = await prisma.paymentBox.findMany({
      where: { config_id, NOT: { id } },
    });
  } else {
    paymentBoxes = await prisma.paymentBox.findMany({ where: { config_id } });
  }

  return (
    <>
      <PaymentBoxForm
        id={id}
        value={value}
        isEditMode={isEditMode}
        paymentBoxes={paymentBoxes}
      />
    </>
  );
}
