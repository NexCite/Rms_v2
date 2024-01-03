"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import styled from "@emotion/styled";
import { $Enums, Prisma } from "@prisma/client";
import { FormatNumberWithFixed } from "@rms/lib/global";

import {
  Autocomplete,
  Card,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { findEnteris } from "@rms/service/entry-service";

import dayjs from "dayjs";
import Loading from "@rms/components/ui/loading";

export default function ExportTable(props: Props) {
  const [isPadding, setTransition] = useTransition();

  const [dataEntries, setDataEntries] = useState<
    Prisma.EntryGetPayload<{
      include: {
        currency: true;
        sub_entries: {
          include: {
            two_digit: true;
            three_digit: true;
            account_entry: true;
            more_than_four_digit: true;
            reference: true;
          };
        };
      };
    }>[]
  >([]);

  useEffect(() => {
    setTransition(() => {
      findEnteris({
        from: dayjs().subtract(60, "days").toDate(),
        to: dayjs().toDate(),
        currency: [],
        two_digit: [],

        include_reference: true,
      }).then((res) => {
        setDataEntries(res.result as any);
      });
    });
  }, [props.currencies, props.two_digits]);

  useEffect(() => {
    if (!isPadding) {
      var totalEl = document.getElementsByClassName("total-amount-sub-entry");
      var debitEl = document.getElementsByClassName("total-amount-sub-entry");
      var creditEl = document.getElementsByClassName("total-amount-sub-entry");
      var totalDebit = 0;
      var totalCredit = 0;
      var totalAmount = 0;

      if (totalEl.length > 0) {
        const totalAmountStr: string[] = [];
        Array.from(totalEl).map((res) => {
          totalAmountStr.push(res.textContent);
        });
        totalAmountStr.map(
          (entry) =>
            (totalAmount += parseFloat(
              entry.replace("L.L", "").replaceAll(",", "")
            ))
        );
      }
      if (debitEl.length > 0) {
        const totalDebitStr: string[] = [];
        Array.from(debitEl).map((res) => {
          totalDebitStr.push(res.textContent);
        });
        totalDebitStr.map(
          (entry) =>
            (totalDebit += parseFloat(
              entry.replace("L.L", "").replaceAll(",", "")
            ))
        );
      }
      if (creditEl.length > 0) {
        const totalCreditStr: string[] = [];
        Array.from(creditEl).map((res) => {
          totalCreditStr.push(res.textContent);
        });
        totalCreditStr.map(
          (entry) =>
            (totalCredit += parseFloat(
              entry.replace("L.L", "").replaceAll(",", "")
            ))
        );
      }
      setAmounts({
        amount: totalAmount,
        credit: totalCredit,
        debit: totalDebit,
      });
    }
  }, [isPadding]);

  const [amounts, setAmounts] = useState({
    amount: 0,
    debit: 0,
    credit: 0,
  });
  return (
    <Style>
      <Card variant="outlined">
        <CardHeader
          title={
            <div className="flex items-center justify-between">
              <Typography variant="h5">Sheet State Table</Typography>
              <Typography variant="h5">Result: {dataEntries.length}</Typography>
            </div>
          }
        />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Id</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Debit</TableCell>
                <TableCell>Credit</TableCell>
              </TableRow>
            </TableHead>
            {isPadding ? (
              <TableBody className="h-32">
                <TableRow>
                  <TableCell colSpan={7}>
                    <Loading />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {dataEntries.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell>{res.id}</TableCell>
                    <TableCell>{res.title}</TableCell>
                    <TableCell
                      style={{
                        width: 250,
                        alignItems: "center",
                      }}
                    >
                      {dayjs(res.to_date).format("DD-MM-YYYY hh:mm a")}
                    </TableCell>
                    <SubEntriesComponent
                      currency={res.currency}
                      data={res.sub_entries}
                    />
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="left"
                    style={{ textAlign: "start", fontSize: 25 }}
                  >
                    Total
                  </TableCell>

                  <TableCell align="left" style={{ fontSize: 25 }}>
                    LL {FormatNumberWithFixed(amounts.amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
        <Divider />
      </Card>
    </Style>
  );
}

const SubEntriesComponent = (props: {
  accounts?: Prisma.AccountGetPayload<{}>[];
  data: Prisma.SubEntryGetPayload<{
    include: {
      account_entry: true;
      more_than_four_digit: true;
      reference: true;
      three_digit: true;
      two_digit: true;
    };
  }>[];
  currency: Prisma.CurrencyGetPayload<{}>;
}) => {
  const { amount, credits, debits } = useMemo(() => {
    var amount = 0;

    const debits: Prisma.SubEntryGetPayload<{
      include: {
        account_entry: true;
        more_than_four_digit: true;
        reference: true;
        three_digit: true;
        two_digit: true;
      };
    }>[] = [];
    const credits: Prisma.SubEntryGetPayload<{
      include: {
        account_entry: true;
        more_than_four_digit: true;
        reference: true;
        three_digit: true;
        two_digit: true;
      };
    }>[] = [];
    props.data.map((res) => {
      if (res.type === "Debit") {
        debits.push(res);
      } else {
        credits.push(res);
      }
    });
    if (debits.length >= credits.length) {
      debits.map((res) => (amount += res.amount));
    } else {
      credits.map((res) => (amount += res.amount));
    }

    return {
      debits,
      credits,
      amount,
    };
  }, [props]);

  return (
    <>
      <TableCell>
        {props.currency.symbol}
        <span className="total-amount-sub-entry">
          {FormatNumberWithFixed(amount)}
        </span>
      </TableCell>
      <TableCell>
        <Table size="small">
          <TableBody>
            <TableRow>
              {debits.map((res) => (
                <>
                  <TableCell>
                    <span className="amount-sub-entry-debit">
                      {FormatNumberWithFixed(res.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    (
                    {res.three_digit_id ??
                      res.two_digit_id ??
                      res.more_than_four_digit_id ??
                      res.account_entry_id}
                    ){" "}
                    {res.three_digit?.name ??
                      res.two_digit?.name ??
                      res.more_than_four_digit?.name ??
                      res.account_entry?.username}
                  </TableCell>

                  {res.reference_id && (
                    <TableCell>
                      Reference: ({res.reference_id}) {res.reference?.username}
                    </TableCell>
                  )}
                </>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableCell>
      <TableCell>
        <Table size="small">
          <TableBody>
            <TableRow>
              {credits.map((res) => (
                <>
                  <TableCell>
                    <span className="amount-sub-entry-credit">
                      {FormatNumberWithFixed(res.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    (
                    {res.three_digit_id ??
                      res.two_digit_id ??
                      res.more_than_four_digit_id ??
                      res.account_entry_id ??
                      res.reference_id}
                    ){" "}
                    {res.three_digit?.name ??
                      res.two_digit?.name ??
                      res.more_than_four_digit?.name ??
                      res.account_entry?.username ??
                      res.reference?.username}
                  </TableCell>

                  {res.reference_id && (
                    <TableCell>
                      Reference: ({res.reference_id}) {res.reference?.username}
                    </TableCell>
                  )}
                </>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableCell>
    </>
  );
};
type Props = {
  config: {
    logo: string;
    name: string;
  };

  two_digits?: Prisma.Two_DigitGetPayload<{}>[];
  three_digits?: Prisma.Three_DigitGetPayload<{
    include: { two_digit: true };
  }>[];
  more_digits?: Prisma.More_Than_Four_DigitGetPayload<{
    include: { three_digit: true };
  }>[];
  accounts?: Prisma.Account_EntryGetPayload<{ include: { currency } }>[];
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

const Style = styled.div`
  table {
    td,
    th {
      font-size: 13pt;
    }
  }
`;
