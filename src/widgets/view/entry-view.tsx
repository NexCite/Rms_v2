"use client";
import { Prisma } from "@prisma/client";
import { Button } from "@rms/components/ui/button";
import { Table, tbody, td, TableHeader, tr } from "@rms/components/ui/table";
import useAlertHook from "@rms/hooks/alert-hooks";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { deleteEntry } from "@rms/service/entry-service";
import moment from "moment";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useMemo, useTransition } from "react";
import styled from "@emotion/styled";

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
  const { createAlert } = useAlertHook();
  const pathName = usePathname();
  return (
    <Style className="card">
      <div className="mb-10 gap-5 justify-end flex">
        <Button
          className="bg-black"
          onClick={() => {
            const isConfirm = confirm(
              `Do You sure you want to delete ${props.entry.title} id:${props.entry.id} `
            );
            if (isConfirm) {
              setPadding(async () => {
                const result = await deleteEntry(props.entry.id);

                createAlert({ ...result, replace: "/admin/accounting/entry" });
              });
            }
          }}
          color="dark"
          disabled={isPadding}
        >
          {isPadding ? (
            <>
              {" "}
              <Loader2 /> loading...
            </>
          ) : (
            "Delete"
          )}
        </Button>

        <Button
          onClick={() => push(pathName + "/form?id=" + props.entry.id)}
          className="bg-black"
          color="dark"
          disabled={isPadding}
        >
          Edit
        </Button>

        <Button
          onClick={() => push(pathName + "/export")}
          className="bg-black"
          color="dark"
          disabled={isPadding}
        >
          Export
        </Button>
      </div>
      <table className="w-full min-w-max table-auto text-left">
        <TableHeader>
          <tr className="head">
            <td className="w-full">Debit</td>
            <td className="w-full">Credit</td>
            <td className="w-full">Amount</td>
          </tr>
        </TableHeader>

        <tbody>
          {props.entry.sub_entries.map((res) => (
            <tr key={res.id}>
              {res.type === "Debit" && (
                <>
                  <td>
                    ({res.two_digit?.id ?? ""}
                    {res.three_digit?.id ?? ""}
                    {res.more_than_four_digit?.id ?? ""}
                    {res.account_entry?.id ?? ""}) {res.two_digit?.name ?? ""}
                    {res.three_digit?.name ?? ""}
                    {res.account_entry?.username ?? ""}
                  </td>
                  <td></td>
                </>
              )}
              {res.type === "Credit" && (
                <>
                  <td></td>
                  <td>
                    ({res.two_digit?.id ?? ""}
                    {res.three_digit?.id ?? ""}
                    {res.more_than_four_digit?.id ?? ""}
                    {res.account_entry?.id ?? ""}) {res.two_digit?.name ?? ""}
                    {res.three_digit?.name ?? ""}
                    {res.account_entry?.username ?? ""}
                  </td>
                </>
              )}
              <td>
                {props.entry.currency.symbol}
                {FormatNumberWithFixed(res.amount)}
              </td>
              <td></td>
              <td></td>
            </tr>
          ))}
          <tr>
            <td></td>
            <td></td>
            <td></td>
            <td className="head">Total</td>
            <td>
              {props.entry.currency.symbol}
              {FormatNumberWithFixed(amount)}
            </td>
          </tr>
          <tr>
            <td colSpan={6}></td>
          </tr>
          <tr></tr>
          <tr className="head ">
            <td>ID</td>
            <td>Date</td>
            <td>Last Update</td>

            <td colSpan={2}> Create By</td>
          </tr>
          <tr>
            <td>{props.entry.id}</td>
            <td>
              {moment(props.entry.to_date).format("dddd DD-MM-yyy hh:mm")}
            </td>
            <td>
              {moment(props.entry.modified_date).format("dddd DD-MM-yyy hh:mm")}
            </td>
            <td colSpan={2}>{props.entry.user?.username}</td>
          </tr>
          <tr className="head ">
            <td>Title</td>
            <td>Description</td>
            <td>Note</td>
          </tr>

          <tr>
            <td>{props.entry.title}</td>
            <td>{props.entry.description}</td>
            <td>{props.entry.note}</td>
            <td colSpan={2}></td>
          </tr>

          <tr className="head">
            <td>PDF</td>
            <td colSpan={5}>
              {props.entry.media && (
                <iframe
                  width={"100%"}
                  height={600}
                  frameBorder={0}
                  src={`/api/media/${props.entry.media.path}`}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </Style>
  );
}
const Style = styled.div`
  table {
    tbody,
    tr,
    td,
    th {
      color: black;
      font-size: 12pt;

      border: #00000013 solid 1px;
    }

    table {
      margin-top: 5px;
      thead {
        tr {
          th {
          }
        }
      }
    }
  }
`;
