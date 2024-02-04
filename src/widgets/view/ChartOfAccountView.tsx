"use client";

import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Option,
  Select,
  Stack,
  Table,
  Typography,
} from "@mui/joy";
import IChartOfAccount from "@nexcite/Interfaces/IChartOfAccount";
import ICurrency from "@nexcite/Interfaces/ICurrency";
import NexCiteButton from "@nexcite/components/button/NexCiteButton";
import NexCiteCard from "@nexcite/components/card/NexCiteCard";
import {
  FormatNumberWithFixed,
  VoucherSchema,
  exportToExcel,
} from "@nexcite/lib/global";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { createMRTColumnHelper } from "material-react-table";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AiFillFileExcel } from "react-icons/ai";

type Props = {
  id: string;
  chartOfAccount: IChartOfAccount;
  currencies: ICurrency[];

  chartOfAccounts: IChartOfAccount[];
  vouchers: Prisma.VoucherGetPayload<{
    include: {
      currency: true;
      voucher_items: {
        include: {
          currency: true;
          chart_of_account: true;
          reference_chart_of_account: true;
        };
      };
    };
  }>[];
};

export default function ChartOfAccountView(props: Props) {
  const [selectedCurrency, setSelectedCurrency] = useState<
    ICurrency | undefined
  >(props.chartOfAccount?.currency);

  const [selectedChartOfAccounts, setSelectedChartOfAccounts] = useState<
    typeof props.chartOfAccounts
  >([]);

  const filteredVoucher = useMemo(() => {
    if (selectedChartOfAccounts.length == 0) return props.vouchers;
    return props.vouchers.filter((res) => {
      let isFound = false;
      res.voucher_items.forEach((res) => {
        if (
          selectedChartOfAccounts.find((res2) =>
            res.chart_of_account_id.startsWith(res2.id)
          )
        ) {
          isFound = true;
        }
        if (
          selectedChartOfAccounts.find((res2) =>
            res.reference_chart_of_account_id?.startsWith(res2.id)
          )
        ) {
          isFound = true;
        }
      });
      return isFound;
    });
  }, [selectedChartOfAccounts, props.vouchers]);

  const { credit, debit } = useMemo(() => {
    let debit: number = 0,
      credit: number = 0;
    filteredVoucher?.forEach((res) => {
      res.voucher_items.forEach((res) => {
        if (
          res.chart_of_account_id.startsWith(props.id) ||
          res.reference_chart_of_account_id?.startsWith(props.id)
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
  }, [props.id, filteredVoucher]);
  const [selectData, setSelectData] = useState({
    from: dayjs().startOf("month").toDate(),
    to: dayjs().endOf("month").toDate(),
  });
  const { replace } = useRouter();
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  useEffect(() => {
    const channel = new BroadcastChannel("voucher");

    channel.addEventListener("message", () => {
      setTransition(() => {
        replace(pathName);
      });
    });
    return () => {
      channel.removeEventListener("message", () => {
        channel.close();
      });
    };
  }, [pathName, replace]);
  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Grid xs={12}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="start"
          spacing={2}
        >
          <FormControl sx={{ width: "100%" }}>
            <FormLabel>Chart of Accounts</FormLabel>
            <Autocomplete
              className="w-full"
              name="chart_of_accounts"
              disableCloseOnSelect
              options={props.chartOfAccounts}
              value={selectedChartOfAccounts}
              getOptionLabel={(option: any) =>
                `${option.id} ${option.name} ${option.currency?.symbol ?? ""}`
              }
              onChange={(e, newValue) => {
                setSelectedChartOfAccounts(newValue as any);
              }}
              multiple
              placeholder="chart of accounts"
            />{" "}
          </FormControl>

          <FormControl sx={{}}>
            <FormLabel>Currency</FormLabel>
            <Select
              sx={{ minWidth: 120 }}
              disabled={!!props.chartOfAccount.currency}
              defaultValue={selectedCurrency?.id}
            >
              {props.currencies.map((res) => {
                return (
                  <Option
                    key={res.id}
                    value={res.id}
                    onClick={(e) => {
                      setSelectedCurrency(res);
                    }}
                  >
                    {res.name}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="end"
          spacing={2}
        >
          {" "}
          <FormControl sx={{}}>
            <FormLabel>From</FormLabel>
            <Input
              fullWidth
              type="date"
              value={dayjs(selectData.from).format("YYYY-MM-DD")}
              onChange={(e) => {
                setSelectData((prev) => ({
                  ...prev,
                  from: e.target.valueAsDate,
                }));
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>To</FormLabel>
            <Input
              fullWidth
              type="date"
              value={dayjs(selectData.to).format("YYYY-MM-DD")}
              onChange={(e) => {
                setSelectData((prev) => ({
                  ...prev,
                  to: e.target.valueAsDate,
                }));
              }}
            />
          </FormControl>
          <NexCiteButton
            isPadding={isPadding}
            onClick={(e) => {
              replace(
                window.location.pathname +
                  `?from=${selectData.from.getTime()}&to=${selectData.to.getTime()}`
              );
            }}
          >
            Search
          </NexCiteButton>
        </Stack>
      </Grid>
      <Grid xs={12}>
        <div className="grid grid-cols-1   lg:grid-cols-3 gap-5 w-full">
          <Card variant="outlined" invertedColors>
            <CardContent orientation="horizontal">
              <CardContent>
                <Typography level="body-md">Total Debit</Typography>
                <Typography level="h2">
                  {selectedCurrency?.symbol ?? "$"}
                  {FormatNumberWithFixed(
                    debit * (selectedCurrency?.rate ?? 1),
                    2
                  )}
                </Typography>
              </CardContent>
            </CardContent>
          </Card>
          <Card variant="outlined" invertedColors>
            <CardContent orientation="horizontal">
              <CardContent>
                <Typography level="body-md">Total Credit</Typography>
                <Typography level="h2">
                  {selectedCurrency?.symbol ?? "$"}
                  {FormatNumberWithFixed(
                    credit * (selectedCurrency?.rate ?? 1),
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
                <Typography level="h2">
                  {debit - credit > 0 ? "Debit" : "Credit"}{" "}
                  {selectedCurrency?.symbol ?? "$"}
                  {FormatNumberWithFixed(
                    (debit - credit) * (selectedCurrency?.rate ?? 1),
                    2
                  )}
                </Typography>
              </CardContent>
            </CardContent>
          </Card>
        </div>
      </Grid>
      <Grid xs={12}>
        <NexCiteCard title="Account Details">
          <Box sx={{ maxWidth: "100%", overflow: "auto" }}>
            <Table
              size="lg"
              sx={{
                maxWidth: "100%",
                overflow: "auto",
                "& th": {
                  width: 200,
                  alignItems: "center",
                  textAlign: "center",
                },
                "& td": {
                  width: 200,
                  alignItems: "center",
                  textAlign: "center",
                },
              }}
            >
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Debit/Credit</th>
                  <th>Currency</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Account Type</th>
                  <th>Business ID</th>
                  <th>Limit Amount</th>
                  <th>Country</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td align="center">{props.chartOfAccount.id}</td>
                  <td align="center">{props.chartOfAccount.name}</td>
                  <td align="center">
                    {props.chartOfAccount.chart_of_account_type}
                  </td>
                  <td align="center">{props.chartOfAccount.debit_credit}</td>
                  <td align="center">{selectedCurrency?.name}</td>
                  <td align="center">{props.chartOfAccount.first_name}</td>
                  <td align="center">{props.chartOfAccount.last_name}</td>

                  <td align="center">{props.chartOfAccount.email}</td>
                  <td align="center">{props.chartOfAccount.phone_number}</td>
                  <td align="center">{props.chartOfAccount.account_type}</td>
                  <td align="center">{props.chartOfAccount.business_id}</td>
                  <td align="center">{props.chartOfAccount.limit_amount}</td>
                  <td align="center">{props.chartOfAccount.country}</td>
                  <td align="center">{props.chartOfAccount.address}</td>
                </tr>
              </tbody>
            </Table>
          </Box>
        </NexCiteCard>
      </Grid>
      <Grid xs={12}>
        {" "}
        <Card>
          <CardContent>
            <div className="flex gap-5   flex-col justify-between w-full">
              <div className="flex justify-between">
                <NexCiteButton
                  className="nexcite-btn sm:w-full md:w-fit"
                  icon={<AiFillFileExcel />}
                  onClick={(e) => {
                    exportToExcel({
                      sheet: "chart of account",
                      fileName: "ChartOfAccount",
                      from: selectData.from,
                      to: selectData.to,
                      id: "ChartOfAccount_" + props.chartOfAccount.name,
                    });
                  }}
                >
                  Export Excel
                </NexCiteButton>
              </div>
            </div>
            <Table
              borderAxis="both"
              stickyFooter
              stickyHeader
              id={"ChartOfAccount_" + props.chartOfAccount.name}
            >
              <thead>
                <tr>
                  <th>Date</th>
                  <th align="center" colSpan={3}>
                    <Typography order={1} textAlign={"center"}>
                      Debit
                    </Typography>
                  </th>
                  <th align="center" colSpan={3}>
                    {" "}
                    <Typography textAlign={"center"}>Credit</Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVoucher.map((item) => {
                  const data = item.voucher_items.filter(
                    (res) =>
                      !res.chart_of_account_id.startsWith(
                        props.chartOfAccount.id
                      )
                  );

                  return data.map((res) => (
                    <tr key={res.id}>
                      <td align="center">
                        {item.to_date.toLocaleDateString()}{" "}
                        {item.to_date.toLocaleTimeString()}
                      </td>
                      {res.debit_credit === "Credit" && (
                        <td align="center" colSpan={3}>
                          {" "}
                        </td>
                      )}
                      <td align="center" key={res.id} colSpan={3}>
                        <Stack
                          direction={"row"}
                          justifyContent={"space-around"}
                          sx={{
                            "& p": {
                              textAlign: "center",
                              width: "100%",
                            },
                          }}
                        >
                          <Typography>
                            {res.currency?.symbol}
                            {FormatNumberWithFixed(res.amount, 2)}
                          </Typography>
                          <Typography>
                            {res.chart_of_account.name}{" "}
                            {res.chart_of_account_id}
                          </Typography>
                        </Stack>
                      </td>
                      {res.debit_credit === "Debit" && (
                        <td align="center" colSpan={3}>
                          {" "}
                        </td>
                      )}
                    </tr>
                  ));
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td align="center" colSpan={3}>
                    {" "}
                    {selectedCurrency?.symbol ?? "$"}
                    {FormatNumberWithFixed(
                      credit * (selectedCurrency?.rate ?? 1),
                      2
                    )}
                  </td>
                  <td align="center" colSpan={3}>
                    {selectedCurrency?.symbol ?? "$"}
                    {FormatNumberWithFixed(
                      debit * (selectedCurrency?.rate ?? 1),
                      2
                    )}
                  </td>
                </tr>
                <tr>
                  {" "}
                  <td></td>
                  <td align="center" colSpan={6}>
                    {" "}
                    Total
                  </td>
                </tr>
                <tr>
                  <td></td>
                  <td align="center" colSpan={6}>
                    {debit - credit > 0 ? "Debit" : "Credit"}{" "}
                    {selectedCurrency?.symbol ?? "$"}
                    {FormatNumberWithFixed(
                      (debit - credit) * (selectedCurrency?.rate ?? 1),
                      2
                    )}
                  </td>
                </tr>
              </tfoot>
            </Table>
          </CardContent>
        </Card>{" "}
      </Grid>
    </Grid>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<VoucherSchema>();
const columns = [
  columnGroupedDataHelper.accessor("id", { header: "ID" }),
  columnGroupedDataHelper.accessor("title", { header: "Title" }),
  columnGroupedDataHelper.accessor("currency.symbol", {
    header: "Currency",
  }),
  columnGroupedDataHelper.accessor((row) => row.to_date.toLocaleDateString(), {
    header: "Date",
    id: "date",
  }),
];
