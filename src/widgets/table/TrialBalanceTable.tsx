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
        from: dayjs().startOf("month").toDate(),
        to: dayjs().endOf("month").toDate(),
      };
    }
  }, [serachParams]);

  const [selectData, setSelectData] = useState(dateSearchParams);
  const [digit, setDigit] = useState(serachParams.get("digit") ?? "");

  const [isPadding, setTransition] = useTransition();

  const { replace } = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState(props.currencies[0]);
  const [total, setTotal] = useState({
    totalDebit: 0,
    totalCredit: 0,
    totalBalance: 0,
  });

  useEffect(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    props.data.forEach((item) => {
      totalDebit += item.totalDebit;
      totalCredit += item.totalCredit;
    });
    setTotal((prev) => ({
      ...prev,
      totalDebit,
      totalCredit,
      totalBalance: totalDebit - totalCredit,
    }));
  }, [props.data]);
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
                    `?from=${selectData.from.toLocaleDateString()}&to=${selectData.to.toLocaleDateString()}&digit=${digit}`
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
          {props.data.map((item) => (
            <tr key={item.id}>
              <td>
                {item.id} {item.name}
              </td>
              <td>
                {selectedCurrency?.symbol ?? "$"}
                {FormatNumberWithFixed(
                  item.totalDebit * (selectedCurrency?.rate ?? 1),
                  2
                )}
              </td>
              <td>
                {selectedCurrency?.symbol ?? "$"}
                {FormatNumberWithFixed(
                  item.totalCredit * (selectedCurrency?.rate ?? 1),
                  2
                )}
              </td>
              {(() => {
                const total = item.totalDebit - item.totalCredit;

                if (total > 0) {
                  return (
                    <>
                      <td>
                        {selectedCurrency?.symbol ?? "$"}
                        {FormatNumberWithFixed(
                          total * (selectedCurrency?.rate ?? 1),
                          2
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
                          2
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
                2
              )}
            </td>
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalCredit * (selectedCurrency?.rate ?? 1),
                2
              )}
            </td>
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalBalance * (selectedCurrency?.rate ?? 1),
                2
              )}
            </td>{" "}
            <td>
              {selectedCurrency?.symbol ?? "$"}
              {FormatNumberWithFixed(
                total.totalBalance * (selectedCurrency?.rate ?? 1),
                2
              )}
            </td>
          </tr>
        </tfoot>
      </Table>
    </NexCiteCard>
  );
}
