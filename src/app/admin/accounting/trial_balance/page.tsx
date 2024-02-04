import { cleanUpGroupChartOfAccount } from "@nexcite/lib/global";
import {
  findChartOfAccountsByDigit,
  findGroupedChartOfAccountVouchersV1,
} from "@nexcite/service/ChartOfAccountService";
import { findCurrencies } from "@nexcite/service/CurrencyService";
import { userAuth } from "@nexcite/service/auth-service";
import TrialBalanceTable from "@nexcite/widgets/table/TrialBalanceTable";
import dayjs from "dayjs";

export default async function page(props: {
  searchParams: { id: any; from: any; to: any };
}) {
  const auth = await userAuth();

  const currencies = await findCurrencies(auth.config.id);

  const findChartOfAccountsByDigitResult = await findChartOfAccountsByDigit(
    auth.config_id,
    2
  );

  return (
    <TrialBalanceTable
      currencies={currencies}
      data={findChartOfAccountsByDigitResult.body}
    />
  );
}
