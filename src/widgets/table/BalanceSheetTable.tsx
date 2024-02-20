"use client";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";

import { Option, Select, Stack } from "@mui/joy";
import Table from "@mui/joy/Table";
import IChartOfAccount from "@nexcite/Interfaces/IChartOfAccount";
import NexCiteButton from "@nexcite/components/button/NexCiteButton";
import NexCiteCard from "@nexcite/components/card/NexCiteCard";
import NumericFormatCustom from "@nexcite/components/input/TextFieldNumber";
import { FormatNumberWithFixed, exportToExcel } from "@nexcite/lib/global";
import { $Enums } from "@prisma/client";
import dayjs from "dayjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AiFillFileExcel } from "react-icons/ai";

type Props = {
  data: (IChartOfAccount & {
    totalDebit?: number;
    totalCredit?: number;
  })[];
  currencies?: {
    id?: number;
    name?: string;
    symbol?: string;
    rate?: number;
  }[];
};

type CommonType = {
  name: string;
  debit: number;
  credit: number;
  debitBalance: number;
  creditBalance: number;
  debit_credit: $Enums.DebitCreditType;
};
export default function BalanceSheetTable(props: Props) {
  const serachParams = useSearchParams();
  const dateSearchParams = useMemo(() => {
    const from = serachParams.get("from");
    const to = serachParams.get("to");
    if (from && to) {
      return {
        from: dayjs(from).startOf("d").toDate(),
        to: dayjs(to).endOf("d").toDate(),
      };
    } else {
      return {
        from: dayjs().startOf("d").toDate(),
        to: dayjs().endOf("d").toDate(),
      };
    }
  }, [serachParams]);

  const [selectData, setSelectData] = useState(dateSearchParams);
  const [digit, setDigit] = useState(serachParams.get("digit") ?? "");

  const [isPadding, setTransition] = useTransition();

  const { replace } = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState(props.currencies[0]);
  const [total, setTotal] = useState({
    totalDebitEL: 0,
    totalCreditEL: 0,
    totalDebitAssets: 0,
    totalCreditAssets: 0,
  });
  const tableData = useMemo(() => {
    const rate = selectedCurrency.rate ?? 1;
    const classEL: CommonType[] = [];
    const assets: CommonType[] = [];
    props.data.map((item, index) => {
      const total = item.totalDebit * rate - item.totalCredit * rate;

      if (
        item.chart_of_account_type === "Equity" ||
        item.chart_of_account_type === "Liabilities"
      ) {
        classEL.push({
          name: `${item.id} ${item.name}`,
          debit: item.totalDebit * rate,
          credit: item.totalCredit * rate,
          debitBalance: total,
          debit_credit: item.debit_credit,
          creditBalance: 0,
        });
      } else if (item.chart_of_account_type === "Assets") {
        assets.push({
          name: `${item.id} ${item.name}`,
          debit: item.totalDebit * rate,
          credit: item.totalCredit * rate,
          debitBalance: total,
          debit_credit: item.debit_credit,
          creditBalance: 0,
        });
      }
    });
    return {
      classEL,
      assets,
    };
  }, [props.data, selectedCurrency]);
  useEffect(() => {
    let totalDebitEL = 0,
      totalCreditEL = 0,
      totalDebitAssets = 0,
      totalCreditAssets = 0;
    tableData.assets.forEach((item) => {
      totalDebitAssets += item.debit;
      totalCreditAssets += item.credit;
    });
    tableData.classEL.forEach((item) => {
      totalDebitEL += item.debit;
      totalCreditEL += item.credit;
    });

    setTotal((prev) => ({
      totalDebitAssets,
      totalDebitEL,
      totalCreditEL,
      totalCreditAssets,
    }));
  }, [tableData]);

  return (
    <NexCiteCard>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems="end"
        justifyContent={"space-between"}
        spacing={2}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="end"
          spacing={2}
        >
          <FormControl>
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
          <FormControl>
            <FormLabel>Digit</FormLabel>
            <Input
              fullWidth
              value={digit}
              placeholder="digit"
              slotProps={{
                input: {
                  component: NumericFormatCustom,
                },
              }}
              onChange={(e) => {
                setDigit((prev) => e.target.value);
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Currency</FormLabel>
            <Select sx={{ minWidth: 120 }} defaultValue={selectedCurrency?.id}>
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
          <NexCiteButton
            isPadding={isPadding}
            onClick={(e) => {
              setTransition(() => {
                replace(
                  window.location.pathname +
                    `?from=${selectData.from.toLocaleDateString()}&to=${selectData.to.toLocaleDateString()}&digit=${digit}&class=${JSON.stringify(
                      ["1", "2", "3", "4", "5"]
                    )}`
                );
              });
            }}
          >
            Search
          </NexCiteButton>
        </Stack>

        <NexCiteButton
          icon={<AiFillFileExcel />}
          onClick={(e) => {
            setTransition(() => {
              exportToExcel({
                sheet: "TrialTable",
                id: "TrialTable",
                fileName: "Trial",
                from: selectData.from,
                to: selectData.to,
              });
            });
          }}
        >
          Export Excel
        </NexCiteButton>
      </Stack>

      <Table
        borderAxis="both"
        stickyFooter
        id="TrialTable"
        sx={{
          "td , th": {
            textAlign: "center",
          },
        }}
      >
        <thead>
          <tr>
            <th colSpan={2}>Equity & Liabilities</th>
            <th colSpan={2}>Assets</th>
          </tr>
          <tr>
            <th>Amount</th>
            <th>Account</th>
            <th>Amount</th>
            <th>Account</th>
          </tr>
        </thead>
        <tbody>
          {tableData.classEL.length > tableData.assets.length
            ? tableData.classEL.map((item, index) => (
                <tr key={item.name}>
                  <td>
                    {item.debit - item.credit !== 0 && (
                      <>
                        {" "}
                        {item.debit_credit === "Debit"
                          ? "Debit"
                          : "Credit"}{" "}
                      </>
                    )}
                    {selectedCurrency?.symbol ?? "$"}
                    {FormatNumberWithFixed(item.debit - item.credit, 3, true)}
                  </td>
                  <td>{item.name}</td>
                  {tableData.assets[index] ? (
                    <>
                      <td>
                        {tableData.assets[index].debit -
                          tableData.assets[index].credit !==
                          0 && (
                          <>
                            {" "}
                            {tableData.assets[index].debit_credit === "Debit"
                              ? "Debit"
                              : "Credit"}{" "}
                          </>
                        )}
                        {selectedCurrency?.symbol ?? "$"}
                        {FormatNumberWithFixed(
                          tableData.assets[index].debit -
                            tableData.assets[index].credit,
                          3,
                          true
                        )}{" "}
                      </td>
                      <td>{tableData.assets[index].name}</td>
                    </>
                  ) : (
                    <>
                      <td></td>
                      <td></td>
                    </>
                  )}
                </tr>
              ))
            : tableData.assets.map((item, index) => (
                <tr key={item.name}>
                  {tableData.classEL[index] ? (
                    <>
                      <td>
                        {tableData.classEL[index].debit -
                          tableData.classEL[index].credit !==
                          0 && (
                          <>
                            {" "}
                            {tableData.classEL[index].debit_credit === "Debit"
                              ? "Debit"
                              : "Credit"}{" "}
                          </>
                        )}
                        {selectedCurrency?.symbol ?? "$"}
                        {FormatNumberWithFixed(
                          tableData.classEL[index].debit -
                            tableData.classEL[index].credit,
                          3,
                          true
                        )}{" "}
                      </td>
                      <td>{tableData.classEL[index].name}</td>
                    </>
                  ) : (
                    <>
                      <td></td>
                      <td></td>
                    </>
                  )}
                  <td>
                    {item.debit - item.credit !== 0 && (
                      <>
                        {" "}
                        {item.debit_credit === "Debit"
                          ? "Debit"
                          : "Credit"}{" "}
                      </>
                    )}
                    {selectedCurrency?.symbol ?? "$"}
                    {FormatNumberWithFixed(item.debit - item.credit, 3, true)}
                  </td>
                  <td>{item.name}</td>
                </tr>
              ))}
        </tbody>

        <tfoot>
          <tr>
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalDebitEL * (selectedCurrency?.rate ?? 1) -
                  total.totalCreditEL * (selectedCurrency?.rate ?? 1),
                3,
                true
              )}
            </td>{" "}
            <td>Total</td>
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalDebitAssets * (selectedCurrency?.rate ?? 1) -
                  total.totalCreditAssets * (selectedCurrency?.rate ?? 1),
                3,
                true
              )}
            </td>{" "}
            <td>Total</td>
          </tr>
        </tfoot>
      </Table>
    </NexCiteCard>
  );
}
