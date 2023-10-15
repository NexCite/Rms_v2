"use server";

import { Prisma } from "@prisma/client";

import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import { confirmActivity } from "./activity-service";
import { ActivityStatus } from "@rms/models/CommonModel";
export async function createEntry(
  props: Prisma.EntryUncheckedCreateInput,
  activity?: {
    id: number;
    status?: ActivityStatus;
  }
) {
  return handlerServiceAction(
    async (auth) => {
      props.user_id = auth.id;
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
    async (auth) => {
      props.user_id = auth.id;
      await prisma.entry.update({ data: props, where: { id: id } });
      return;
    },
    "Edit_Entry",
    true,
    props
  );
}
export async function deleteEntry(id: number) {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.entry.delete({ where: { id: id } });

      // if (auth.type === "Admin") {
      //   await prisma.subEntry.deleteMany({ where: { entry_id: id } });
      //   await prisma.media.deleteMany({ where: { entry_id: id } });
      //   return await prisma.entry.delete({ where: { id: id } });
      // } else
      //   return await prisma.entry.update({
      //     where: { id: id },
      //     data: { status: "Deleted", user_id: id },
      //   });
    },
    "Delete_Entry",
    true,
    { id }
  );
}
