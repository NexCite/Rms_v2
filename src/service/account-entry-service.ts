"use server";
import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

export async function createAccountEntry(
  props: Prisma.Account_EntryCreateArgs
) {
  return handlerServiceAction(
    async (auth) => {
      await prisma.account_Entry.create(props);
      return;
    },
    "Add_AccountEntry",
    true
  );
}

export async function updateAccountEntry(
  props: Prisma.Account_EntryUpdateArgs
) {
  return handlerServiceAction(
    async (auth) => {
      return await prisma.account_Entry.update(props);
    },
    "Edit_AccountEntry",
    true
  );
}
export async function deleteAccountEntry(id: number) {
  return handlerServiceAction(
    async (auth) => {
      if (auth.type === "Admin") {
        await prisma.account_Entry.delete({ where: { id: id } });
      } else {
        await prisma.account_Entry.update({
          where: { id: id },
          data: { status: "Deleted" },
        });
      }

      return;
    },
    "Delete_AccountEntry",
    true
  );
}
