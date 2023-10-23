import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import EquityView from "@rms/widgets/view/equity-view";
import React from "react";

export default async function page(props: {
  params: { id: string };
  searchParams: {};
}) {
  const config_id = await getConfigId();

  const result = await prisma.equity.findFirst({
    where: { id: +props.params.id, config_id },
    include: {
      agent_boxes: true,
      coverage_boxes: true,
      expensive_box: true,
      manager_boxes: true,
      adjustment_boxes: true,
      credit_boxes: true,
      p_l: true,
    },
  });

  return <EquityView equity={result} />;
}