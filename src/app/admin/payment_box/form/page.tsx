import PaymentBoxForm from "@rms/widgets/form/payment-box-form";
import { Prisma } from "@prisma/client";
import prisma from "@rms/prisma/prisma";
import React from "react";

export default async function page(props: {
  params: {};
  searchParams: { id?: string };
}) {
  const id = +props.searchParams.id;
  const isEditMode = id ? true : false;

  var value: Prisma.PaymentBoxGetPayload<{}>;

  var paymentBoxes: Prisma.PaymentBoxGetPayload<{}>[];

  var relations: {
    clients: Prisma.ClientBoxGetPayload<{}>[];
    coverage: Prisma.CoverageBoxGetPayload<{}>[];
    agents: Prisma.AgentBoxGetPayload<{}>[];
    p_l: Prisma.P_LBoxGetPayload<{}>[];
    expensive: Prisma.ExpensiveBoxGetPayload<{}>[];
  };

  if (isEditMode) {
    value = await prisma.paymentBox.findUnique({
      where: { id },
      select: {
        agent_boxes: true,
      },
    } as any);

    const agents = await prisma.agentBox.findMany({
      where: { payment_box_id: id },
    });

    const coverage = await prisma.coverageBox.findMany({
      where: { payment_box_id: id },
    });

    const clients = await prisma.clientBox.findMany({
      where: { payment_box_id: id },
    });

    const p_l = await prisma.p_LBox.findMany({});

    const expensive = await prisma.expensiveBox.findMany({
      where: { payment_box_id: id },
    });

    relations = {
      clients,
      coverage,
      agents,
      p_l,
      expensive,
    };

    paymentBoxes = await prisma.paymentBox.findMany({ where: { NOT: { id } } });
  } else {
    paymentBoxes = await prisma.paymentBox.findMany();
  }

  console.log("herentewr", value, relations);

  return (
    <>
      <PaymentBoxForm
        id={id}
        value={value}
        isEditMode={isEditMode}
        paymentBoxes={paymentBoxes}
        relations={relations}
      />
    </>
  );
}
