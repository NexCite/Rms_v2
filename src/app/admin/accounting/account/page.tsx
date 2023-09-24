import { getUserInfo } from "@rms/lib/auth";
import prisma from "@rms/prisma/prisma";
import AccountEntryTable from "@rms/widgets/table/account-entry-table";

export default async function page() {
  const user = await getUserInfo();

  const accounts = await prisma.account_Entry.findMany({
    include: {
      three_digit: true,
      more_than_four_digit: true,
      _count: true,
      two_digit: true,
    },
    orderBy: { modified_date: "desc" },
    where: {
      status: user.type === "Admin" ? undefined : "Enable",
    },
  });

  return (
    <div>
      <AccountEntryTable accounts={accounts} />
    </div>
  );
}
