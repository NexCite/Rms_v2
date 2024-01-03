import prisma from "@rms/prisma/prisma";

import Loading from "@rms/components/ui/loading";
import getUserFullInfo from "@rms/service/user-service";
import SheetStateTable from "@rms/widgets/table/sheet-state-table ";
import { Suspense } from "react";

export default async function Entry(props: { params: {} }) {
  const info = await getUserFullInfo();

  const two_digits = await prisma.two_Digit.findMany({
      where: {
        config_id: info.config.id,
      },
      orderBy: {
        type: "asc",
      },
    }),
    three_digits = await prisma.three_Digit.findMany({
      where: {
        config_id: info.config.id,
      },
      include: { two_digit: true },
      orderBy: {
        type: "asc",
      },
    }),
    more_digits = await prisma.more_Than_Four_Digit.findMany({
      where: {
        config_id: info.config.id,
      },
      include: { three_digit: true },
      orderBy: {
        type: "asc",
      },
    }),
    accounts = await prisma.account_Entry.findMany({
      where: {
        config_id: info.config.id,
      },
      include: { currency: true },
      orderBy: {
        type: "asc",
      },
    });

  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  return (
    <Suspense fallback={<Loading />}>
      <SheetStateTable
        currencies={currencies}
        config={info.config}
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
    </Suspense>
  );
}
