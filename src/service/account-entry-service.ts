"use server";
import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

export async function createAccount_Entry(
  data: Prisma.Account_EntryUncheckedCreateInput,
  node: $Enums.Account_Entry_Type
) {
  return handlerServiceAction(
    async (auth) => {
      data.user_id = auth.id;

      await prisma.account_Entry.create({ data });
      return;
    },
    node === "Client"
      ? "Add_Entry_Client"
      : node === "IB"
      ? "Add_Entry_IB"
      : "Add_Entry_Supplier",

    true,
    data
  );
}

export async function updateAccount_Entry(
  id: number,
  data: Prisma.Account_EntryUncheckedUpdateInput,
  node: $Enums.Account_Entry_Type
) {
  return handlerServiceAction(
    async (auth) => {
      data.user_id = auth.id;

      return await prisma.account_Entry.update({ where: { id }, data: data });
    },
    node === "Client"
      ? "Edit_Entry_Client"
      : node === "IB"
      ? "Edit_Entry_IB"
      : "Edit_Entry_Supplier",
    true,
    data
  );
}
export async function deleteAccount_Entry(
  id: number,
  node: $Enums.Account_Entry_Type
) {
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
    node === "Client"
      ? "Delete_Entry_Client"
      : node === "IB"
      ? "Delete_Entry_IB"
      : "Delete_Entry_Supplier",
    true,
    { id }
  );
}
