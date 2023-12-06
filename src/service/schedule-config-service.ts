"use server";

import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import moment from "moment";

export async function createScheuleConfig(config_id: number) {
  let result = await prisma.scheduleConfig.findFirst({
    where: { config_id: config_id },
  });

  if (!result) {
    const fromTime = moment(),
      toTime = moment(),
      fromOverTime = moment(),
      toOverTime = moment();
    fromTime.hour(8);
    fromTime.minute(0);
    fromTime.second(0);
    fromTime.millisecond(0);

    toTime.hour(4);
    toTime.minute(0);

    toTime.second(0);
    toTime.millisecond(0);

    fromOverTime.hour(4);
    fromOverTime.minute(0);

    fromOverTime.second(0);
    fromOverTime.millisecond(0);

    toOverTime.hour(11);
    toOverTime.minute(0);

    toOverTime.second(59);
    toOverTime.millisecond(59);

    result = await prisma.scheduleConfig.create({
      data: {
        config_id: config_id,
        from_time: fromTime.toDate(),
        to_time: toTime.toDate(),
        from_over_time: fromOverTime.toDate(),
        to_over_time: toOverTime.toDate(),
      },
    });
  }
}

export async function updateScheuleConfig(
  id: number,
  props: Prisma.ScheduleConfigUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.config_id = config_id;
      await prisma.scheduleConfig.update({
        where: { id: id },
        data: props,
      });
    },
    "Edit_Schedule_Config",
    true,
    props
  );
}

export async function deleteScheuleConfig(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      return await prisma.scheduleConfig.delete({
        where: { id: id, config_id },
      });
      // if (auth.type === "Admin") {
      //   await prisma.entry.deleteMany({ where: { ScheuleConfig_id: id } });
      //   await prisma.invoice.deleteMany({ where: { ScheuleConfig_id: id } });
      //   return await prisma.ScheuleConfig.delete({ where: { id: id,config_id } });
      // } else
      //   return await prisma.entry.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted", user_id: info.user.id },
      //   });
    },
    "Delete_Schedules_Config",
    true,
    { id }
  );
}
export async function resetScheduleConfig(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      await prisma.scheduleConfig.update({
        where: { id, config_id },
        data: {
          modified_date: new Date(),
          create_date: new Date(),
        },
      });
    },
    "Reset",
    true
  );
}
