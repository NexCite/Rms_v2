"use client";
import {
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { Prisma } from "@prisma/client";
import NexCiteButton from "@rms/components/button/nexcite-button";
import NexCiteCard from "@rms/components/card/nexcite-card";
import Authorized from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { deleteEntry } from "@rms/service/entry-service";
import dayjs from "dayjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import { MdDelete, MdEdit, MdPictureAsPdf } from "react-icons/md";

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
  const { back } = useRouter();

  const { totalDebit } = useMemo(() => {
    var totalDebit = 0;
    // totalCredit = 0;
    var a = 0;
    props.entry.sub_entries.forEach((e) => {
      if (e.type === "Credit") {
        // totalCredit += e.amount;
      } else {
        totalDebit += e.amount;
      }
    });
    return { totalDebit };
  }, [props]);
  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
  const pathName = usePathname();
  return (
    <NexCiteCard
      title={`#${props.entry.id} ${props.entry.title}`}
      className="max-w-[580px] m-auto"
    >
      {props.entry.create_date.getTime() !==
        props.entry.modified_date.getTime() && (
        <div className="h-1 bg-yellow-300 mb-5"></div>
      )}
      <CardContent>
        <div className="mb-10 gap-5 justify-end flex">
          <Authorized permission="Delete_Entry">
            <NexCiteButton
              icon={<MdDelete />}
              className="bg-red-600"
              type="button"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${props.entry.title} id:${props.entry.id} `
                );
                if (isConfirm) {
                  setTransition(async () => {
                    const result = await deleteEntry(props.entry.id);

                    toast.OpenAlert({
                      ...result,
                      replace: "/admin/accounting/entry",
                    });
                    if (result.status === 200) {
                      back();
                    }
                  });
                }
              }}
            >
              Delete
            </NexCiteButton>
          </Authorized>

          <Authorized permission="Edit_Entry">
            <Link href={`/admin/accounting/entry/form?id=${props.entry.id}`}>
              <NexCiteButton
                icon={<MdEdit />}
                type="button"
                isPadding={isPadding}
              >
                Edit
              </NexCiteButton>
            </Link>
          </Authorized>
          <Link href={pathName + "/export"}>
            <NexCiteButton
              className="bg-orange-400"
              type="button"
              icon={<MdPictureAsPdf />}
            >
              Export
            </NexCiteButton>
          </Link>
        </div>

        <div className="flex gap-8 flex-col">
          <div className="flex gap-2 flex-col ">
            <h1 className="text-xl">Description</h1>
            <Divider />
            <p className="text-lg opacity-90">{props.entry.description}</p>
          </div>
          {props.entry.note && props.entry.note !== "" && (
            <div className="flex gap-2 flex-col ">
              <h1 className="text-xl">Note</h1>
              <Divider />
              <p className="text-lg opacity-90">{props.entry.note}</p>
            </div>
          )}{" "}
          {
            <div className="flex gap-2 flex-col ">
              <h1 className="text-xl">Currency</h1>
              <Divider />
              <p className="text-lg opacity-90">
                {props.entry.currency.symbol}
              </p>
            </div>
          }
          <div className="flex gap-2 flex-col ">
            <h1 className="text-xl">Amount</h1>
            <Divider />
            <p>
              {props.entry.currency.symbol}
              {FormatNumberWithFixed(totalDebit)}
            </p>
          </div>
          {props.entry.media && (
            <div className="flex gap-2 flex-col ">
              <h1 className="text-xl">PDF</h1>
              <Divider />
              {props.entry.media && (
                <iframe
                  width={"100%"}
                  height={600}
                  src={`/api/media/${props.entry.media.path}`}
                />
              )}
            </div>
          )}
          <div className="flex gap-2 flex-col ">
            <h1 className="text-xl">Create Date</h1>
            <Divider />
            <p className="text-lg opacity-90">
              {dayjs(props.entry.create_date).format("	ddd, MMM D, YYYY h:mm A")}
            </p>
          </div>
          <div className="flex gap-2 flex-col ">
            <h1 className="text-xl">Modified Date</h1>
            <Divider />
            <p className="text-lg opacity-90">
              {dayjs(props.entry.modified_date).format(
                "	ddd, MMM D, YYYY h:mm A"
              )}
            </p>
          </div>
        </div>

        <Table className="w-full">
          <TableHead>
            <TableRow>
              <TableCell>Debit</TableCell>
              <TableCell>Credit</TableCell>
              {props.entry.rate && (
                <>
                  <TableCell>Rate</TableCell>
                  <TableCell>Rate Amount</TableCell>
                </>
              )}
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
                {props.entry.rate && (
                  <>
                    <TableCell>
                      {FormatNumberWithFixed(props.entry.rate)}
                    </TableCell>
                    <TableCell>
                      ${FormatNumberWithFixed(res.amount / props.entry.rate)}
                    </TableCell>
                  </>
                )}

                <TableCell>
                  {props.entry.currency.symbol}
                  {FormatNumberWithFixed(res.amount)}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="head">Total</TableCell>
              <TableCell></TableCell>

              <TableCell>
                {props.entry.currency.symbol}
                {FormatNumberWithFixed(totalDebit)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </NexCiteCard>
  );
}
