import prisma from "@rms/prisma/prisma";

import { getConfigId } from "@rms/lib/config";
import SheetStateTable from "@rms/widgets/table/sheet-state-table ";

export default async function Entry(props: { params: {} }) {
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

  const config = await prisma.config.findFirst({
    where: {
      id: config_id,
    },
    select: {
      logo: true,
      name: true,
    },
  });

  const currencies = await prisma.currency.findMany({ where: { config_id } });
  return (
    <div>
      <SheetStateTable
        currencies={currencies}
        config={config}
        accounts={accounts.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
        more_digits={more_digits.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
        three_digits={three_digits.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
        two_digits={two_digits.sort((a, b) =>
          (a.type + "").localeCompare(b.type + "")
        )}
      />
    </div>
  );
}
