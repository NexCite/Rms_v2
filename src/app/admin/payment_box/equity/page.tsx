import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";

import EquityTable from "@rms/widgets/table/equity-table";

export default async function page() {
  const config_id = await getConfigId();

  const result = await prisma.equity.findMany({
    where: { config_id },
    include: {
      agent_boxes: true,
      coverage_boxes: true,
      expensive_box: true,
      manager_boxes: true,
      adjustment_boxes: true,
      credit_boxes: true,
      p_l: true,
    },
    orderBy: {
      to_date: "desc",
    },
  });

  return <div>{<EquityTable boxes={result} />}</div>;
}
