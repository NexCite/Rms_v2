import prisma from "@rms/prisma/prisma";

export default async function page() {
  const accounts = await prisma.account_Entry.findMany({
    include: {
      three_digit: true,
      more_than_four_digit: true,
      _count: true,
      two_digit: true,
    },
    orderBy: { modified_date: "desc" },
  });

  return (
    <div className="container">
      <AccountTableComponent accounts={accounts} />
    </div>
  );
}
