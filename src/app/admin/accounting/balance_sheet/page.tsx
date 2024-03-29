import prisma from "@nexcite/prisma/prisma";
import { findChartOfAccountsByDigit } from "@nexcite/service/ChartOfAccountService";
import { userAuth } from "@nexcite/service/auth-service";
import BalanceSheetTable from "@nexcite/widgets/table/BalanceSheetTable";

export default async function page(props: { searchParams: { id: any } }) {
  const auth = await userAuth();

  const currencies = await prisma.currency.findMany({
    where: { config_id: auth.config_id },
  });

  const findChartOfAccountsByDigitResult = await findChartOfAccountsByDigit(
    auth.config_id
  );

  return (
    <BalanceSheetTable
      currencies={currencies}
      data={findChartOfAccountsByDigitResult.body}
    />
  );
}
