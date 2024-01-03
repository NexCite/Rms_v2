"use client";
import { Prisma } from "@prisma/client";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import React, { useCallback, useEffect, useState, useTransition } from "react";
import {
  JournalVouchers,
  VoucherSearchSchema,
} from "../schema/journal-voucher";
import dayjs from "dayjs";
import Table from "@mui/joy/Table";
import MenuItem from "@mui/joy/MenuItem";

import { FormatNumber } from "@rms/lib/global";
import Authorized from "@rms/components/ui/authorized";
import { usePathname } from "next/navigation";
import Link from "next/link";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Switch from "@mui/joy/Switch";

import Input from "@mui/joy/Input";
import Autocomplete from "@mui/joy/Autocomplete";
import Typography from "@mui/joy/Typography";
import NexCiteButton from "@rms/components/button/nexcite-button";
import { MdSearch } from "react-icons/md";
import { boolean, z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import NumericFormatCustom from "@rms/components/ui/text-field-number";
import { findVoucherService } from "@rms/service/voucher-service";

const columnHelper = createMRTColumnHelper<JournalVouchers>();

export default function JournalVoucherTable(props: {
  journalVouchers: JournalVouchers[];

  chartOfAccounts: Prisma.ChartOfAccountGetPayload<{}>[];
}) {
  const [data, setData] = useState<JournalVouchers[]>([]);
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const table = useMaterialReactTable({
    columns,
    enableRowActions: true,
    renderRowActionMenuItems: ({
      row: {
        original: { id },
      },
    }) => [
      <Authorized permission="Edit_Chart_Of_Account" key={1}>
        <div className="w-[100px] text-center">
          <Link
            href={pathName + "/form?id=" + id}
            className="w-full block text-center"
          >
            Edit
          </Link>
        </div>
      </Authorized>,
      // <Authorized permission={"Reset"} key={2}>
      //   <MenuItem
      //     disabled={isPadding}
      //     className="cursor-pointer"
      //     onClick={() => {
      //       const isConfirm = confirm(
      //         `Do You sure you want to reset ${name} id:${id} `
      //       );
      //       if (isConfirm) {
      //         setTransition(async () => {
      //           const result = await reset(id);

      //           toast.OpenAlert(result);
      //         });
      //       }
      //     }}
      //   >
      //     {isPadding ? <> reseting...</> : "Reset"}
      //   </MenuItem>
      // </Authorized>,
      <Authorized permission="Delete_Chart_Of_Account" key={3}>
        <MenuItem
          disabled={isPadding}
          className="cursor-pointer"
          onClick={() => {
            const isConfirm = confirm(
              `Do You sure you want to delete ${name} id:${id} `
            );
            if (isConfirm) {
              setTransition(async () => {
                // const result = await deleteChart(id);
                // toast.OpenAlert(result);
              });
            }
          }}
        >
          {isPadding ? <> deleting...</> : "Delete"}
        </MenuItem>
      </Authorized>,
    ],
    data: data,
    renderDetailPanel: ({ row }) => (
      <Table>
        <thead>
          <tr>
            <th>D/C</th>
            <th>Amount</th>
            <th>Account</th>
            <th>Reffrence Account</th>
            <th>Amount/Rate</th>
          </tr>
        </thead>
        <tbody>
          {row.original.voucher_items.map((res) => (
            <tr key={res.id}>
              <td>{res.debit_credit}</td>
              <td>
                {res.currency.symbol}
                {FormatNumber(res.amount, 2)}
              </td>

              <td>
                {res.chart_of_account.id} {res.chart_of_account.name}
              </td>

              <td>
                {res.reference_chart_of_account?.id}{" "}
                {res.reference_chart_of_account?.name}
              </td>
              <td>${res.amount / res.rate}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </Table>
    ),
  });
  const form = useForm<VoucherSearchSchema>({
    resolver: zodResolver(VoucherSearchSchema),
    defaultValues: {
      include_reffrence: false,
      chart_of_accounts: [],
      from: dayjs().startOf("D").toDate(),
      to: dayjs().endOf("D").toDate(),
      currencies: [],
      id: undefined,
    },
  });
  useEffect(() => {
    setTransition(() => {
      findVoucherService(form.formState.defaultValues as any).then((res) => {
        setData(res.result);
      });
    });
  }, [findVoucherService]);
  const handleSubmit = useCallback((values: VoucherSearchSchema) => {
    findVoucherService(values).then((res) => {
      setData(res.result);
    });
  }, []);
  return (
    <div>
      <form
        className="mb-5 flex flex-col gap-5 "
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex justify-end">
          <NexCiteButton
            label="Search"
            icon={<MdSearch />}
            isPadding={isPadding}
          ></NexCiteButton>
        </div>
        <div className="flex gap-5 flex-col">
          <div className="flex flex-col lg:flex-row  gap-5 items-center">
            <Controller
              control={form.control}
              name="id"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>Id</FormLabel>
                  <Input
                    onChange={(e) => {
                      field.onChange(e.target.valueAsDate);
                    }}
                    value={field.value}
                    placeholder="id"
                    type="number"
                  />
                </FormControl>
              )}
            />
            <Controller
              control={form.control}
              name="from"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>From Date</FormLabel>
                  <Input
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      field.onChange(
                        dayjs(e.target.valueAsDate).startOf("d").toDate()
                      )
                    }
                    placeholder="from date"
                    type="date"
                  />
                </FormControl>
              )}
            />
            <Controller
              control={form.control}
              name="to"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                >
                  <FormLabel>To Date</FormLabel>
                  <Input
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      field.onChange(
                        dayjs(e.target.valueAsDate).endOf("d").toDate()
                      )
                    }
                    placeholder="to date"
                    type="date"
                  />
                </FormControl>
              )}
            />
            {/* <Controller
              control={form.control}
              name="chart_of_accounts"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                  {...field}
                >
                  <FormLabel>For</FormLabel>
                  <Autocomplete
                    multiple={true}
                    disableCloseOnSelect
                    limitTags={1}
                    onChange={(_, v) => {
                      field.onChange(v);
                    }}
                    options={props.chartOfAccounts}
                    getOptionKey={(e) => e.id}
                    getOptionLabel={(e: any) => `${e.id} ${e.name}`}
                    isOptionEqualToValue={(e) =>
                      field.value.find((res) => res.id === e.id) ? true : false
                    }
                    placeholder="for"
                    value={field.value}
                  />
                </FormControl>
              )}
            /> */}
          </div>
          {/* <div>
            <Controller
              control={form.control}
              name="include_reffrence"
              render={({ formState, fieldState, field }) => (
                <FormControl
                  className="w-full"
                  error={Boolean(fieldState.error)}
                  {...field}
                >
                  <Typography
                    component="label"
                    endDecorator={
                      <Switch checked={field.value} sx={{ ml: 1 }} />
                    }
                  >
                    Include Reffrence
                  </Typography>
                </FormControl>
              )}
            />
          </div> */}
        </div>
      </form>

      <MaterialReactTable table={table} />
    </div>
  );
}

const columns = [
  columnHelper.accessor("id", {
    header: "Id",
  }),
  columnHelper.accessor("title", {
    header: "Title",
  }),
  columnHelper.accessor(
    (row) => dayjs(row.to_date).format("DD-MM-YYYY hh:mm a"),
    {
      id: "to_date",
      header: "Date",
    }
  ),
  columnHelper.accessor((row) => row.currency.name, {
    id: "currency_id",
    header: "Currency",
  }),
];
