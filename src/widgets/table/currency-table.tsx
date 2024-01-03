"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { deleteCurrency, resetCurrency } from "@rms/service/currency-service";
import {
  MRT_ColumnDef,
  MRT_PaginationState,
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";
import useHistoryStore from "@rms/hooks/history-hook";
import ExportData from "@rms/components/other/export-data";
import { deleteAccountEntry } from "@rms/service/account-entry-service";
import LoadingClient from "@rms/components/other/loading-client";

type Props = {
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

export default function CurrencyTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
  const historyTablePageStore = useHistoryStore<MRT_PaginationState>(
    "currency-table-page",
    { pageIndex: 0, pageSize: 100 }
  )();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);
  const table = useMaterialReactTable({
    columns,
    data: props.currencies,
    enableRowActions: true,
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },

    enableRowSelection: true,
    enableSelectAll: true,
    editDisplayMode: "row",
    onPaginationChange: historyTablePageStore.set,
    state: {
      showLoadingOverlay: isPadding,
    },
    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
        <Authorized permission="Edit_Currency" key={1}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,
        <Authorized permission={"Reset"} key={2}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to reset ${name} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await resetCurrency(id);

                  toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> reseting...</> : "Reset"}
          </MenuItem>
        </Authorized>,
        <Authorized permission="Delete_Currency" key={3}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${name} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await deleteCurrency(id);

                  toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> deleting...</> : "Delete"}
          </MenuItem>
        </Authorized>,
      ];
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <ExportData data={props.currencies} table={table} />
    ),

    initialState: {
      density: "comfortable",
      columnVisibility: {
        status: false,
        email: false,
        gender: false,
        country: false,
        address1: false,
        address2: false,
      },
      pagination: historyTablePageStore.data,
    },
  });

  return (
    <Card variant="outlined">
      <CardHeader
        title={<Typography variant="h5">Currency Table</Typography>}
      />

      <LoadingClient>
        <MaterialReactTable table={table} />
      </LoadingClient>
    </Card>
  );
}

const columnsHelper = createMRTColumnHelper<Prisma.CurrencyGetPayload<{}>>();
const columns = [
  columnsHelper.accessor("id", {
    header: "ID",
    Cell: ({ row: { original } }) => (
      <div
        className={`text-center rounded-sm ${
          original.create_date.toLocaleTimeString() !==
          original.modified_date.toLocaleTimeString()
            ? "bg-yellow-400"
            : ""
        }`}
      >
        {original.id}
      </div>
    ),
  }),
  columnsHelper.accessor("name", {
    header: "Name",
  }),
  columnsHelper.accessor("symbol", {
    header: "Symbol",
  }),

  columnsHelper.accessor((row) => row.create_date.toLocaleDateString(), {
    id: "create_date",

    header: "Create Date",
  }),

  columnsHelper.accessor(
    (row) => (row) => row.modified_date.toLocaleDateString(),
    {
      id: "modified_date",

      header: "Create Date",
    }
  ),
  columnsHelper.accessor("rate", {
    header: "Rate",
  }),
];
