import { cleanUpGroupChartOfAccount } from "@nexcite/lib/global";
import { findGroupedChartOfAccountVouchersV1 } from "@nexcite/service/ChartOfAccountService";
import { findCurrencies } from "@nexcite/service/CurrencyService";
import { userAuth } from "@nexcite/service/auth-service";
import BalanceSheetTableTest from "@nexcite/widgets/table/BalanceSheetTable";
import dayjs from "dayjs";

export default async function page(props: {
  searchParams: { id: any; from: any; to: any };
}) {
  const auth = await userAuth();
  let { from, to } = props.searchParams;
  from = dayjs(from ?? dayjs().startOf("month"))
    .startOf("D")
    .toDate();
  to = dayjs(to ?? dayjs().endOf("month"))
    .endOf("D")
    .toDate();
  const currencies = await findCurrencies(auth.config.id);
  const chartOfAccounts = await findGroupedChartOfAccountVouchersV1({
    from,
    to,
  });
  if (chartOfAccounts.status !== 200) {
    return;
  }

  return (
    <BalanceSheetTableTest
      currencies={currencies}
      data={cleanUpGroupChartOfAccount(chartOfAccounts.body)}
    />
  );
}
