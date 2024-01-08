"use client";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/joy";
import Loading from "@rms/components/ui/loading";
import { FormatNumberWithFixed, VoucherSchema } from "@rms/lib/global";
import {
  findChartOfAccountByClientId,
  findChartOfAccountForAccountsServiceGrouded,
} from "@rms/service/chart-of-account-service";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ChartOfAccountSchema } from "../schema/journal-voucher";
import ChartOfAccountTable from "../table/chart-of-account-table";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import { Prisma } from "@prisma/client";

type Props = { id: string };

export default function ChartOfAccountView(props: Props) {
  const [chartOfAccount, setChartOfAccount] = useState<ChartOfAccountSchema>();
  const [voucher, setVoucher] = useState<VoucherSchema[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<any[]>();

  const [isPadding, setTransation] = useTransition();
  useEffect(() => {
    setTransation(async () => {
      const chartOfAccount = await findChartOfAccountByClientId({
        id: props.id,
        include_reffrence: true,
      });
      const chartOfAccounts = await findChartOfAccountForAccountsServiceGrouded(
        {
          accountId: props.id,
        }
      );
      setChartOfAccounts(chartOfAccounts.result);
      setChartOfAccount(chartOfAccount.result.chartOfAccount);
      setVoucher(chartOfAccount.result.voucher);
    });
  }, [props.id]);
  const { credit, debit } = useMemo(() => {
    let debit: number = 0,
      credit: number = 0;
    voucher.forEach((res) => {
      res.voucher_items.forEach((res) => {
        if (
          res.chart_of_account_id === props.id ||
          res.reffrence_chart_of_account_id === props.id
        ) {
          if (res.debit_credit == "Debit") {
            debit += res.amount / res.currency.rate;
          } else {
            credit += res.amount / res.currency.rate;
          }
        }
      });
    });
    return { debit, credit };
  }, [voucher, props.id]);
  const table = useMaterialReactTable({
    data: chartOfAccounts ?? [],
    columns: columns,
  });

  return isPadding && chartOfAccount && chartOfAccounts ? (
    <Loading />
  ) : (
    <div className="flex gap-5 flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card variant="outlined" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={(debit * 100) / (debit + credit)}
            ></CircularProgress>
            <CardContent>
              <Typography level="body-md">Total Debit</Typography>
              <Typography level="h2">
                {chartOfAccount?.currency?.symbol ?? ""}
                {FormatNumberWithFixed(
                  debit * (chartOfAccount?.currency?.rate ?? 1),
                  2
                )}
              </Typography>
            </CardContent>
          </CardContent>
        </Card>
        <Card variant="outlined" invertedColors>
          <CardContent orientation="horizontal">
            <CircularProgress
              size="lg"
              determinate
              value={(credit * 100) / (debit + credit)}
            ></CircularProgress>
            <CardContent>
              <Typography level="body-md">Total Credit</Typography>
              <Typography level="h2">
                {chartOfAccount?.currency?.symbol ?? ""}
                {FormatNumberWithFixed(
                  credit * (chartOfAccount?.currency?.rate ?? 1),
                  2
                )}
              </Typography>
            </CardContent>
          </CardContent>
        </Card>
        <Card variant="outlined" invertedColors>
          <CardContent orientation="horizontal">
            <CardContent>
              <Typography level="body-md">Total</Typography>
              <Typography
                level="h2"
                color={debit - credit > 0 ? "success" : "danger"}
              >
                {chartOfAccount?.currency?.symbol ?? ""}
                {FormatNumberWithFixed(
                  debit - credit * (chartOfAccount?.currency?.rate ?? 1),
                  2
                )}
              </Typography>
            </CardContent>
          </CardContent>
        </Card>
      </div>

      <ChartOfAccountTable
        accountId={props.id}
        currency={chartOfAccount?.currency}
      />
    </div>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<
  Prisma.ChartOfAccountGetPayload<{
    include: {
      currency: true;
      reffrence_voucher_items: {
        include: {
          currency: true;
        };
      };
      voucher_items: {
        include: {
          currency: true;
        };
      };
    };
  }>
>();
const columns = [
  columnGroupedDataHelper.accessor("id", { header: "ID" }),
  columnGroupedDataHelper.accessor("name", { header: "Name" }),
  columnGroupedDataHelper.accessor(
    (row) => {
      let debit = 0,
        credit = 0;
      row.voucher_items.forEach((res) => {
        if (res.debit_credit == "Debit") {
          debit += res.amount / res.currency.rate;
        } else {
          credit += res.amount / res.currency.rate;
        }
      });
      return debit - credit;
    },
    { header: "Total" }
  ),
];
