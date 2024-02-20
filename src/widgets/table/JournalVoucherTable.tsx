"use client";
import Table from "@mui/joy/Table";
import dayjs from "dayjs";

import {
  MRT_ColumnFiltersState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import { useEffect, useMemo, useState, useTransition } from "react";

import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Authorized from "@nexcite/components/other/Authorized";
import { FormatNumber, FormatNumberWithFixed } from "@nexcite/lib/global";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Input from "@mui/joy/Input";

import { Grid, Stack } from "@mui/joy";
import { MenuItem } from "@mui/material";
import NexCiteButton from "@nexcite/components/button/NexCiteButton";
import NexCiteCard from "@nexcite/components/card/NexCiteCard";
import { useToast } from "@nexcite/hooks/toast-hook";

import IVoucher from "@nexcite/Interfaces/IVoucher";
import ExportVoucher from "@nexcite/components/other/ExportVoucher";
import { MdSearch } from "react-icons/md";
import { deleteVoucherService } from "@nexcite/service/voucher-service";

const columnHelper = createMRTColumnHelper<IVoucher>();

export default function JournalVoucherTable(props: {
  search?: {
    id?: number;
    from: Date;
    to: Date;
  };
  config: { logo: string; name: string };
  data: IVoucher[];
}) {
  const pathName = usePathname();

  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
  const [showExport, setExport] = useState<React.ReactNode>();
  const searchParams = useSearchParams();
  const columnFilter = useMemo(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      return JSON.parse(filter) as MRT_ColumnFiltersState;
    }
    return [];
  }, [searchParams]);

  const [filter, setFilter] = useState<MRT_ColumnFiltersState>(columnFilter);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    query.set("filter", JSON.stringify(filter));
    window.history.replaceState(null, "", `?${query}`);
  }, [filter]);

  const table = useMaterialReactTable({
    columns,

    enableRowActions: true,
    enableStickyHeader: true,

    enablePagination: false,
    layoutMode: "semantic",
    onColumnFiltersChange: setFilter,

    renderRowActionMenuItems: ({ row: { original } }) => [
      <Authorized key={1} permission="Update_Chart_Of_Account">
        <Link
          href={pathName + "/form?id=" + original.id}
          className="w-full block text-center"
        >
          <MenuItem>Edit</MenuItem>
        </Link>
      </Authorized>,
      <Authorized key={2} permission="Update_Chart_Of_Account">
        <MenuItem
          onClick={(e) => {
            setExport(
              <ExportVoucher
                config={props.config}
                voucher={original}
                onClose={() => {
                  setExport(undefined);
                }}
              />
            );
          }}
        >
          Export
        </MenuItem>
      </Authorized>,

      <Authorized permission="Delete_Chart_Of_Account" key={3}>
        <MenuItem
          disabled={isPadding}
          className="cursor-pointer"
          onClick={() => {
            const isConfirm = confirm(
              `Do You sure you want to delete  id:${original.id} `
            );
            if (isConfirm) {
              setTransition(async () => {
                const result = await deleteVoucherService({ id: original.id });

                toast.OpenAlert(result);
              });
            }
          }}
        >
          {isPadding ? <> deleting...</> : "Delete"}
        </MenuItem>
      </Authorized>,
    ],
    initialState: {
      showColumnFilters: true,
    },
    state: {
      columnFilters: filter,
    },
    data: props.data,
    renderDetailPanel: ({ row }) => (
      <Table
        sx={{
          "td , th": {
            textAlign: "center",
          },
        }}
      >
        <thead>
          <tr>
            <th>D/C</th>
            <th>Amount</th>
            <th>Account</th>

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

              <td>${FormatNumberWithFixed(res.amount / res.rate, 2)}</td>
            </tr>
          ))}
          <tr></tr>
        </tbody>
      </Table>
    ),
  });
  const { replace } = useRouter();

  // useEffect(() => {
  //   const channel = new BroadcastChannel("voucher");

  //   channel.addEventListener("message", () => {
  //     setTransition(() => {
  //       replace(pathName);
  //     });
  //   });
  //   return () => {
  //     channel.removeEventListener("message", () => {
  //       channel.close();
  //     });
  //   };
  // }, [pathName, replace]);

  return (
    <NexCiteCard title="Vouchers">
      <Stack spacing={3}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const id = formData.get("id");
            const from = formData.get("from");
            const to = formData.get("to");
            const query = new URLSearchParams(window.location.search);
            query.set("id", id as string);
            query.set("from", from as string);
            query.set("to", to as string);
            const location = window.location.pathname + `?${query.toString()}`;
            setTransition(() => {
              replace(location);
            });
          }}
        >
          <Grid container spacing={2} sx={{ flexGrow: 1, alignItems: "end" }}>
            <Grid xs={12} md={3}>
              <FormControl>
                <FormLabel>ID</FormLabel>
                <Input
                  name="id"
                  fullWidth
                  defaultValue={props.search?.id}
                  placeholder="id"
                  type="number"
                />
              </FormControl>
            </Grid>
            <Grid xs={12} md={3}>
              <FormControl>
                <FormLabel>From Date</FormLabel>

                <Input
                  fullWidth
                  defaultValue={dayjs(props.search.from).format("YYYY-MM-DD")}
                  name="from"
                  placeholder="from date"
                  type="date"
                />
              </FormControl>
            </Grid>
            <Grid xs={12} md={3}>
              <FormControl>
                <FormLabel>To Date</FormLabel>

                <Input
                  fullWidth
                  defaultValue={dayjs(props.search.to).format("YYYY-MM-DD")}
                  name="to"
                  placeholder="to
                   date"
                  type="date"
                />
              </FormControl>
            </Grid>
            <Grid xs={12} md={3}>
              <NexCiteButton
                label="Search"
                icon={<MdSearch />}
                type="submit"
                isPadding={isPadding}
              ></NexCiteButton>
            </Grid>
          </Grid>
        </form>

        {showExport}
        <MaterialReactTable table={table} />
      </Stack>
    </NexCiteCard>
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
