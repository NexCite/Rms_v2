import { getConfigId } from "@nexcite/lib/config";
import prisma from "@nexcite/prisma/prisma";
import EquityView from "@nexcite/widgets/view/EquityView";
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
