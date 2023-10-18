"use server";

import { Prisma } from "@prisma/client";

import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import { confirmActivity } from "./activity-service";
import { ActivityStatus } from "@rms/models/CommonModel";
import { copyMediaTemp } from "./media-service";
export async function createEntry(
  props: Prisma.EntryUncheckedCreateInput,
  activity?: {
    id: number;
    status?: ActivityStatus;
  }
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.user_id = auth.id;
      props.config_id = config_id;

      if (props.media) {
        props.media.create.path = await copyMediaTemp(props.media.create.path);
      }

      if (activity) activity.status = ActivityStatus.Provided;

      await Promise.all([
        prisma.entry.create({ data: props }),
        activity ? confirmActivity(activity) : undefined,
      ]);

      return;
    },
    "Add_Entry",
    true,
    props
  );
}

export async function updateEntry(
  id: number,
  props: Prisma.EntryUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.user_id = auth.id;
      props.config_id = config_id;
      await prisma.entry.update({ data: props, where: { id: id, config_id } });
      return;
    },
    "Edit_Entry",
    true,
    props
  );
}
export async function deleteEntry(id: number) {
  return handlerServiceAction(
    async (auth, config_id) => {
      return await prisma.entry.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.subEntry.deleteMany({ where: { entry_id: id } });
      //   await prisma.media.deleteMany({ where: { entry_id: id } });
      //   return await prisma.entry.delete({ where: { id: id,config_id } });
      // } else
      //   return await prisma.entry.update({
      //     where: { id: id,config_id },
      //     data: { status: "Deleted", user_id: id },
      //   });
    },
    "Delete_Entry",
    true,
    { id }
  );
}
