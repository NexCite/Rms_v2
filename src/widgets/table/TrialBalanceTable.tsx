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

export default function TrialBalanceTable(props: Props) {
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
  const classSearchParams = useMemo(() => {
    const classes = serachParams.get("class");
    if (classes) {
      return JSON.parse(classes) as string[];
    } else {
      return [];
    }
  }, [serachParams]);

  const [selectData, setSelectData] = useState(dateSearchParams);
  const [digit, setDigit] = useState(serachParams.get("digit") ?? "");
  const [classes, setClasses] = useState(classSearchParams);

  const [isPadding, setTransition] = useTransition();

  const { replace } = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState(props.currencies[0]);
  const [total, setTotal] = useState({
    totalDebit: 0,
    totalCredit: 0,
    totalDebitBalance: 0,
    totalCreditBalance: 0,
    totalBalance: 0,
  });
  const tableData = useMemo(() => {
    const rate = selectedCurrency.rate ?? 1;
    return props.data.map((item) => {
      const total = item.totalDebit * rate - item.totalCredit * rate;

      return {
        name: `${item.id} ${item.name}`,
        debit: item.totalDebit * rate,
        credit: item.totalCredit * rate,
        debitBalance: total > 0 ? total : 0,
        creditBalance: total < 0 ? total : 0,
      };
    });
  }, [props.data, selectedCurrency]);
  useEffect(() => {
    let totalDebit = 0,
      totalCredit = 0,
      totalDebitBalance = 0,
      totalCreditBalance = 0;
    tableData.forEach((item) => {
      totalDebit += item.debit;
      totalCredit += item.credit;
      totalDebitBalance += item.debitBalance;
      totalCreditBalance += item.creditBalance;
    });
    setTotal((prev) => ({
      ...prev,
      totalDebit,
      totalCredit,
      totalDebitBalance,
      totalCreditBalance,
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
            <FormLabel>Class</FormLabel>
            <Select
              multiple
              value={classes}
              onChange={(n, v) => {
                setClasses(v);
              }}
            >
              {new Array(9).fill("").map((res, index) => (
                <Option key={index + 1} value={(index + 1).toString()}>
                  {index + 1}
                </Option>
              ))}
            </Select>
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
                      classes
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

      <Table borderAxis="both" stickyFooter id="TrialTable">
        <thead>
          <tr>
            <th> </th>
            <th align="center">Totals Debit</th>
            <th align="center">Totals Credit</th>
            <th align="center">Balances Debit</th>
            <th align="center">Balances Credit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Account</td>
            <td>Debit</td>
            <td>Credit</td>
            <td>Debit</td>
            <td>Credit</td>
          </tr>
          {tableData.map((item) => (
            <tr key={item.name}>
              <td>{item.name}</td>
              <td>
                {selectedCurrency?.symbol ?? "$"}
                {FormatNumberWithFixed(item.debit, 3, true)}
              </td>
              <td>
                {selectedCurrency?.symbol ?? "$"}
                {FormatNumberWithFixed(item.credit, 3, true)}
              </td>
              {(() => {
                const total = item.debit - item.credit;

                if (total > 0) {
                  return (
                    <>
                      <td>
                        {selectedCurrency?.symbol ?? "$"}
                        {FormatNumberWithFixed(
                          total * (selectedCurrency?.rate ?? 1),
                          3,
                          true
                        )}
                      </td>
                      <td>-</td>
                    </>
                  );
                } else if (total < 0) {
                  return (
                    <>
                      <td>-</td>
                      <td>
                        {selectedCurrency?.symbol ?? "$"}
                        {FormatNumberWithFixed(
                          total * (selectedCurrency?.rate ?? 1),
                          3,
                          true
                        )}
                      </td>
                    </>
                  );
                }
                return (
                  <>
                    <td>-</td>
                    <td>-</td>
                  </>
                );
              })()}
            </tr>
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td>Total</td>
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalDebit * (selectedCurrency?.rate ?? 1),
                3,
                true
              )}
            </td>
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalCredit * (selectedCurrency?.rate ?? 1),
                3,
                true
              )}
            </td>
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalDebitBalance * (selectedCurrency?.rate ?? 1),
                2,
                true
              )}
            </td>{" "}
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalCreditBalance * (selectedCurrency?.rate ?? 1),
                2,
                true
              )}
            </td>
          </tr>
        </tfoot>
      </Table>
    </NexCiteCard>
  );
}
