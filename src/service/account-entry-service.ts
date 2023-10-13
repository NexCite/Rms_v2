"use server";
import { Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

export async function createAccountEntry(
  data: Prisma.Account_EntryUncheckedCreateInput
) {
  return handlerServiceAction(
    async (auth) => {
      data.user_id = auth.id;

      await prisma.account_Entry.create({ data });
      return;
    },
    "Add_AccountEntry",
    true,
    data
  );
}

export async function updateAccountEntry(
  id: number,
  data: Prisma.Account_EntryUncheckedUpdateInput
) {
  return handlerServiceAction(
    async (auth) => {
      data.user_id = auth.id;

      return await prisma.account_Entry.update({ where: { id }, data: data });
    },
    "Edit_AccountEntry",
    true,
    data
  );
}
export async function deleteAccountEntry(id: number) {
  return handlerServiceAction(
    async (auth) => {
      await prisma.account_Entry.delete({ where: { id: id } });

      // if (auth.type === "Admin") {
      //   await prisma.account_Entry.delete({ where: { id: id } });
      // } else {
      //   await prisma.account_Entry.update({
      //     where: { id: id },
      //     data: { status: "Deleted", user_id: auth.id },
      //   });
      // }

      return;
    },
    "Delete_AccountEntry",
    true,
    { id }
  );
}
