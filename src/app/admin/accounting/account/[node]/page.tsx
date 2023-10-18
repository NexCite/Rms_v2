import { $Enums } from "@prisma/client";
import { getUserInfo } from "@rms/lib/auth";
import { getConfigId } from "@rms/lib/config";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import Account_EntryTable from "@rms/widgets/table/account-entry-table";

export default async function page(props: {
  params: { node: $Enums.Account_Entry_Type };
}) {
  const config_id = await getConfigId();

  const accounts = await prisma.account_Entry.findMany({
    include: {
      three_digit: true,
      more_than_four_digit: true,
      _count: true,
      two_digit: true,
    },
    orderBy: { modified_date: "desc" },
    where: {
      type: props.params.node,
      config_id,
    },
  });

  return (
    <div>
      <Account_EntryTable accounts={accounts} node={props.params.node} />
    </div>
  );
}
