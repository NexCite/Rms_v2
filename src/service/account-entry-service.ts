"use server";
import { $Enums, Prisma } from "@prisma/client";
import { handlerServiceAction } from "@rms/lib/handler";
import prisma from "@rms/prisma/prisma";

export async function createAccount_Entry(
  props: Prisma.Account_EntryUncheckedCreateInput,
  node: $Enums.Account_Entry_Type
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.user_id = auth.id;
      props.config_id = config_id;

      await prisma.account_Entry.create({ data: props });
      return;
    },
    node === "Client"
      ? "Add_Entry_Client"
      : node === "IB"
      ? "Add_Entry_IB"
      : "Add_Entry_Supplier",

    true,
    props
  );
}

export async function updateAccount_Entry(
  id: number,
  props: Prisma.Account_EntryUncheckedUpdateInput,
  node: $Enums.Account_Entry_Type
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      props.user_id = auth.id;
      props.config_id = config_id;

      return await prisma.account_Entry.update({
        where: { id, config_id },
        data: props,
      });
    },
    node === "Client"
      ? "Edit_Entry_Client"
      : node === "IB"
      ? "Edit_Entry_IB"
      : "Edit_Entry_Supplier",
    true,
    props
  );
}
export async function deleteAccount_Entry(
  id: number,
  node: $Enums.Account_Entry_Type
) {
  return handlerServiceAction(
    async (auth, config_id) => {
      await prisma.account_Entry.delete({ where: { id: id, config_id } });

      // if (auth.type === "Admin") {
      //   await prisma.account_Entry.delete({ where: { id: id,config_id } });
      // } else {
      //   await prisma.account_Entry.update({
      //     where: { id: id,config_id },
      //     props: { status: "Deleted", user_id: auth.id },
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
