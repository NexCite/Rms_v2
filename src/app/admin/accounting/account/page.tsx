import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import { getUserStatus } from "@rms/service/user-service";
import AccountEntryTable from "@rms/widgets/table/account-entry-table";

export default async function page() {
  const accounts = await prisma.account_Entry.findMany({
    include: {
      three_digit: true,
      more_than_four_digit: true,
      _count: true,
      two_digit: true,
    },
    orderBy: { modified_date: "desc" },
    where: {},
  });

  return (
    <div>
      <AccountEntryTable accounts={accounts} />
    </div>
  );
}
