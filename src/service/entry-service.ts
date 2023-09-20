"use server";

import { Prisma } from "@prisma/client";

import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";
export async function createEntry(props: Prisma.EntryCreateInput) {
  return handlerServiceAction(
    async (auth) => {
      await prisma.entry.create({ data: props });
      return;
    },
    "Add_Entry",
    true
  );
}

export async function updateEntry(id: number, props: Prisma.EntryUpdateInput) {
  return handlerServiceAction(
    async (auth) => {
      await prisma.entry.update({ data: props, where: { id: id } });
      return;
    },
    "Edit_Entry",
    true
  );
}
export async function deleteEntry(id: number) {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.subEntry.deleteMany({ where: { entry_id: id } });
        await prisma.media.deleteMany({ where: { entry_id: id } });
        return await prisma.entry.delete({ where: { id: id } });
      } else
        return await prisma.entry.update({
          where: { id: id },
          data: { status: "Deleted" },
        });

      return;
    },
    "Delete_Entry",
    true
  );
}
