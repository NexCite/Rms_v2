import prisma from "@rms/prisma/prisma";

import Loading from "@rms/components/ui/loading";
import getUserFullInfo from "@rms/service/user-service";
import ExportDigitTable from "@rms/widgets/table/export-digit-table";
import { Suspense } from "react";
import SheetStateTable from "@rms/widgets/table/sheet-state-table ";
import ExportDigitWithAccountTable from "@rms/widgets/table/export-digit-with-account-table";

export default async function Entry(props: { params: {} }) {
  const info = await getUserFullInfo();

  const two_digits = await prisma.two_Digit.findMany({
      where: {
        config_id: info.config.id,
      },
    }),
    three_digits = await prisma.three_Digit.findMany({
      where: {
        config_id: info.config.id,
      },
      include: { two_digit: true },
    }),
    more_digits = await prisma.more_Than_Four_Digit.findMany({
      where: {
        config_id: info.config.id,
      },
      include: { three_digit: true },
    }),
    accounts = await prisma.account_Entry.findMany({
      where: {
        config_id: info.config.id,
      },
      include: { currency: true },
    });

  const currencies = await prisma.currency.findMany({
    where: { config_id: info.config.id },
  });
  return (
    <Suspense fallback={<Loading />}>
      {/* <ExportDigitTable
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
      /> */}
      <ExportDigitWithAccountTable
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
      {/* <ExportTable
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
      /> */}
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
