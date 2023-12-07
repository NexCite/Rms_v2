import { $Enums } from "@prisma/client";
import prisma from "@rms/prisma/prisma";

import { getConfigId } from "@rms/lib/config";
import EntryDataTable from "@rms/widgets/table/entry-table";

export default async function Entry(props: {
  params: {};
  searchParams: {
    from_date?: string;
    to_date?: string;
    activity_id?: string;
    id?: string;
    two_digit_id?: string;
    three_digit_id?: string;
    more_digit_id?: string;
    account_id?: string;
    debit?: $Enums.EntryType;
    type?: $Enums.DigitType;
  };
}) {
  const config_id = await getConfigId();

  const two_digits = await prisma.two_Digit.findMany({
      where: {
        config_id,
      },
    }),
    three_digits = await prisma.three_Digit.findMany({
      where: {
        config_id,
      },
      include: { two_digit: true },
    }),
    more_digits = await prisma.more_Than_Four_Digit.findMany({
      where: {
        config_id,
      },
      include: { three_digit: true },
    }),
    accounts = await prisma.account_Entry.findMany({
      where: {
        config_id,
      },
    });

  return (
    <div>
      <EntryDataTable
        accounts={accounts}
        more_digits={more_digits}
        three_digits={three_digits}
        two_digits={two_digits}
      />
    </div>
  );
}
