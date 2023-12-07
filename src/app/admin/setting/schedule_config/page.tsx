import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import ScheduleConfigForm from "@rms/widgets/form/schedule-config-form";

export default async function page() {
  const config_id = await getConfigId();
  var result = await prisma.scheduleConfig.findFirst({ where: { config_id } });

  return <ScheduleConfigForm config={result} />;
}
