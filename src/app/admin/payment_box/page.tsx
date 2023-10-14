import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import AccountEntryTable from "@rms/widgets/table/account-entry-table";

export default async function page() {
  const accounts = await prisma.paymentBox.findMany({});

  return <div>{/* <AccountEntryTable /> */}</div>;
}
