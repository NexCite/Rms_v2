import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import PaymentBoxView from "@rms/widgets/view/payment-box-view";
import React from "react";

export default async function page(props: {
  params: { id: string };
  searchParams: {};
}) {
  const config_id = await getConfigId();

  const result = await prisma.paymentBox.findFirst({
    where: { id: +props.params.id, config_id },
    include: {
      agent_boxes: true,
      coverage_boxes: true,
      expensive_box: true,
      manager_boxes: true,
      p_l: true,
    },
  });

  return <PaymentBoxView payment_box={result} />;
}
