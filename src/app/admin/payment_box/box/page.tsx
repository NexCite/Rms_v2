import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";

import BoxTable from "@rms/widgets/table/box-table";

export default async function page() {
  const config_id = await getConfigId();

  const result = await prisma.paymentBox.findMany({
    where: { config_id },
    include: {
      agent_boxes: true,
      coverage_boxes: true,
      expensive_box: true,
      manager_boxes: true,
      p_l: true,
    },
    orderBy: {
      to_date: "desc",
    },
  });

  return <div>{<BoxTable boxes={result} />}</div>;
}
