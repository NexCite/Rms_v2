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

  var value: Prisma.PaymentBoxGetPayload<{}>;

  var paymentBoxes: Prisma.PaymentBoxGetPayload<{}>[];

  var relations: {
    clients: Prisma.ClientBoxGetPayload<{}>[];
    coverage: Prisma.CoverageBoxGetPayload<{}>[];
    agents: Prisma.AgentBoxGetPayload<{}>[];
    p_l: Prisma.P_LBoxGetPayload<{}>[];
    expensive: Prisma.ExpensiveBoxGetPayload<{}>[];
  };
  const config_id = await getConfigId();

  if (isEditMode) {
    value = await prisma.paymentBox.findFirst({
      where: { config_id, id },
      select: {
        agent_boxes: true,
      },
    } as any);

    const agents = await prisma.agentBox.findMany({
      where: { config_id, payment_box_id: id },
    });

    const coverage = await prisma.coverageBox.findMany({
      where: { config_id, payment_box_id: id },
    });

    const clients = await prisma.clientBox.findMany({
      where: { config_id, payment_box_id: id },
    });

    const p_l = await prisma.p_LBox.findMany({ where: { config_id } });

    const expensive = await prisma.expensiveBox.findMany({
      where: { config_id, payment_box_id: id },
    });

    relations = {
      clients,
      coverage,
      agents,
      p_l,
      expensive,
    };

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
        relations={relations}
      />
    </>
  );
}
