import prisma from "@nexcite/prisma/prisma";
import { findChartOfAccountsByDigit } from "@nexcite/service/ChartOfAccountService";
import { userAuth } from "@nexcite/service/auth-service";
import TrialBalanceTable from "@nexcite/widgets/table/TrialBalanceTable";

export default async function page(props: { searchParams: { id: any } }) {
  const auth = await userAuth();

  const currencies = await prisma.currency.findMany({
    where: { config_id: auth.config_id },
  });

  const findChartOfAccountsByDigitResult = await findChartOfAccountsByDigit(
    auth.config_id
  );

  return (
    <TrialBalanceTable
      currencies={currencies}
      data={findChartOfAccountsByDigitResult.body}
    />
  );
}
