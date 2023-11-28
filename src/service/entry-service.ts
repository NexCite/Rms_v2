"use server";

import { Prisma } from "@prisma/client";
import { FileMapper } from "@rms/lib/common";
import { handlerServiceAction } from "@rms/lib/handler";
import { ActivityStatus } from "@rms/models/CommonModel";
import prisma from "@rms/prisma/prisma";
import { confirmActivity } from "./activity-service";
/**
 *
 * Done
 *
 */
export async function saveEntry(props: {
  entry: Prisma.EntryUncheckedCreateInput;
  media?: Prisma.MediaUncheckedCreateInput;
  subEntries: Prisma.SubEntryUncheckedCreateInput[];
  includeRate?: boolean;
  file?: FormData;
  id?: number;
  activity?: {
    id: number;
    status?: ActivityStatus;
  };
}) {
  return handlerServiceAction(
    async (info, config_id) => {
      props.entry.user_id = info.user.id;
      props.entry.config_id = config_id;
      if (!props.includeRate) {
        props.entry.rate = null;
      }
      if (props.file) {
        props.media = await FileMapper({
          config_id,
          file: props.file,
          title: props.entry.title,
        });
      }

      if (props.activity) props.activity.status = ActivityStatus.Provided;

      const currency = await prisma.currency.findUnique({
        where: { id: props.entry.currency_id, rate: { gt: 0 } },
      });
      if (currency) {
        props.entry.rate = currency.rate;
      }
      var media: Prisma.MediaGetPayload<{}>;
      if (props.id) {
        var tempEntry = await prisma.entry.findUnique({
          where: { id: props.id },
          select: { media: true },
        });
        media = tempEntry.media;
      }
      const entry = props.id
        ? await prisma.entry[`update`]({
            where: { id: props.id },
            data: {
              ...props.entry,
              media: props.media
                ? media?.id === props.media.id
                  ? {
                      update: {
                        id: props.media?.id,
                      },
                    }
                  : undefined
                : media
                ? { delete: {} }
                : {},
            },
          })
        : await prisma.entry[`create`]({
            data: {
              ...props.entry,
              media: props.media
                ? {
                    connect: { id: props.media.id },
                  }
                : undefined,
            },
          });
      if (props.id) {
        await prisma.subEntry.deleteMany({ where: { entry_id: props.id } });
      }
      props.subEntries = props.subEntries.map((res) => {
        res.entry_id = entry.id;
        return res;
      });
      await prisma.subEntry.createMany({ data: props.subEntries });
      props.activity ? await confirmActivity(props.activity) : undefined;
      return;
    },
    "Add_Entry",
    true,
    props
  );
}

/**
 *
 * Done
 *
 */
export async function deleteEntry(id: number) {
  return handlerServiceAction(
    async (info, config_id) => {
      return await prisma.entry.delete({ where: { id: id, config_id } });
    },
    "Delete_Entry",
    true,
    { id }
  );
}
