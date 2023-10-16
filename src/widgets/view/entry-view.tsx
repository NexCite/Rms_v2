"use client";
import { Prisma } from "@prisma/client";
import { Button } from "@rms/components/ui/button";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { deleteEntry } from "@rms/service/entry-service";
import moment from "moment";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useTransition } from "react";
import styled from "@emotion/styled";
import { useStore } from "@rms/hooks/toast-hook";
import {
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

type Props = {
  entry: Prisma.EntryGetPayload<{
    include: {
      currency: true;
      media: true;
      sub_entries: {
        include: {
          account_entry: true;
          more_than_four_digit: true;
          three_digit: true;
          two_digit: true;
        };
      };
      user: true;
    };
  }>;
};

export default function EntryView(props: Props) {
  const { push } = useRouter();

  const amount = useMemo(() => {
    var a = 0;
    props.entry.sub_entries.forEach((e) => {
      if (e.type === "Credit") {
        a += e.amount;
      }
    });
    return a;
  }, [props]);
  const [isPadding, setPadding] = useTransition();
  const store = useStore();
  const pathName = usePathname();
  return (
    <Style className="card">
      <div className="mb-10 gap-5 justify-end flex">
        <LoadingButton
          className={
            isPadding
              ? ""
              : "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
          }
          onClick={() => {
            const isConfirm = confirm(
              `Do You sure you want to delete ${props.entry.title} id:${props.entry.id} `
            );
            if (isConfirm) {
              setPadding(async () => {
                const result = await deleteEntry(props.entry.id);

                store.OpenAlert({
                  ...result,
                  replace: "/admin/accounting/entry",
                });
              });
            }
          }}
          loading={isPadding}
        >
          {isPadding ? (
            <>
              {" "}
              <CircularProgress sx={{ color: "black" }} />
            </>
          ) : (
            "Delete"
          )}
        </LoadingButton>

        <LoadingButton
          onClick={() => push(pathName + "/form?id=" + props.entry.id)}
          className={
            isPadding
              ? ""
              : "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
          }
          loading={isPadding}
        >
          Edit
        </LoadingButton>

        <LoadingButton
          onClick={() => push(pathName + "/export")}
          className={
            isPadding
              ? ""
              : "hover:bg-blue-gray-900   hover:text-brown-50 capitalize bg-black text-white"
          }
          loading={isPadding}
        >
          Export
        </LoadingButton>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Debit</TableCell>
            <TableCell>Credit</TableCell>
            <TableCell>Amount</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {props.entry.sub_entries.map((res) => (
            <TableRow key={res.id}>
              {res.type === "Debit" && (
                <>
                  <TableCell>
                    ({res.two_digit?.id ?? ""}
                    {res.three_digit?.id ?? ""}
                    {res.more_than_four_digit?.id ?? ""}
                    {res.account_entry?.id ?? ""}) {res.two_digit?.name ?? ""}
                    {res.three_digit?.name ?? ""}
                    {res.account_entry?.username ?? ""}
                  </TableCell>
                  <TableCell></TableCell>
                </>
              )}
              {res.type === "Credit" && (
                <>
                  <TableCell></TableCell>
                  <TableCell>
                    ({res.two_digit?.id ?? ""}
                    {res.three_digit?.id ?? ""}
                    {res.more_than_four_digit?.id ?? ""}
                    {res.account_entry?.id ?? ""}) {res.two_digit?.name ?? ""}
                    {res.three_digit?.name ?? ""}
                    {res.account_entry?.username ?? ""}
                  </TableCell>
                </>
              )}
              <TableCell>
                {props.entry.currency.symbol}
                {FormatNumberWithFixed(res.amount)}
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell className="head">Total</TableCell>
            <TableCell>
              {props.entry.currency.symbol}
              {FormatNumberWithFixed(amount)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell colSpan={6}></TableCell>
          </TableRow>
          <TableRow></TableRow>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Last Update</TableCell>

            <TableCell colSpan={2}> Create By</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{props.entry.id}</TableCell>
            <TableCell>
              {moment(props.entry.to_date).format("dddd DD-MM-yyy hh:mm")}
            </TableCell>
            <TableCell>
              {moment(props.entry.modified_date).format("dddd DD-MM-yyy hh:mm")}
            </TableCell>
            <TableCell colSpan={2}>{props.entry.user?.username}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Note</TableCell>
          </TableRow>

          <TableRow>
            <TableCell>{props.entry.title}</TableCell>
            <TableCell>{props.entry.description}</TableCell>
            <TableCell>{props.entry.note}</TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>

          <TableRow className="head">
            <TableCell>PDF</TableCell>
            <TableCell colSpan={5}>
              {props.entry.media && (
                <iframe
                  width={"100%"}
                  height={600}
                  frameBorder={0}
                  src={`/api/media/${props.entry.media.path}`}
                />
              )}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Style>
  );
}
const Style = styled.div`
  table {
    TableBody,
    TableRow,
    TableCell,
    th {
      color: black;
      font-size: 12pt;

      border: #00000013 solid 1px;
    }

    table {
      margin-top: 5px;
      thead {
        TableRow {
          th {
          }
        }
      }
    }
  }
`;
