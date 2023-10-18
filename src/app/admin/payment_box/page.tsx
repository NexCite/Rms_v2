import { getUserInfo } from "@rms/lib/auth";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import AccountEntryTable from "@rms/widgets/table/account-entry-table";

export default async function page() {
  const config_id = await getConfigId();

  const accounts = await prisma.paymentBox.findMany({ where: { config_id } });

  return <div>{/* <AccountEntryTable /> */}</div>;
}
