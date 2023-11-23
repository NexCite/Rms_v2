"use server";

import { Prisma } from "@prisma/client";

import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
import { confirmActivity } from "./activity-service";
import { ActivityStatus } from "@rms/models/CommonModel";
import { copyMediaTemp, deleteMedia, saveFile } from "./media-service";
export async function createEntry(
  props: Prisma.EntryUncheckedCreateInput,
  includeRate: boolean,

  activity?: {
    id: number;
    status?: ActivityStatus;
  }
) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.user_id = info.user.id;
      props.config_id = config_id;
      if (!includeRate) {
        props.rate = null;
      }
      delete (props as any).includeRate;
      if (props.media) {
        props.media.create.path = await saveFile(props.media.create.path);
      }

      if (activity) activity.status = ActivityStatus.Provided;
      const currency = await prisma.currency.findUnique({
        where: { id: props.currency_id, rate: { gt: 0 } },
      });
      if (currency) {
        props.rate = currency.rate;
      }
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
  props: Prisma.EntryUncheckedUpdateInput,
  includeRate?: boolean
) {
  return handlerServiceAction(
    async (info, config_id) => {
      if (!includeRate) {
        props.rate = null;
      }

      delete (props as any).includeRate;

      props.user_id = info.user.id;
      props.config_id = config_id;
      const result = await prisma.entry.findUnique({
        where: { config_id, id: id },
        include: { media: true },
      });
      await prisma.subEntry.deleteMany({ where: { entry_id: id } });
      await prisma.media.deleteMany({ where: { entry_id: id } });

      try {
        await deleteMedia(result.media.path);
      } catch (e) {}

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
    async (info, config_id) => {
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
