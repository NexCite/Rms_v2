"use client";

import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { Activity, ActivityStatus } from "@rms/models/CommonModel";
import { confirmActivity } from "@rms/service/activity-service";
import {
  createMRTColumnHelper,
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import Link from "next/link";
import ExportData from "@rms/components/other/export-data";

type Props = {
  data: Activity[];
};

export default function ActivityTable(props: Props) {
  const [isPadding, setTransition] = useTransition();

  const toast = useToast();

  const columns = useMemo<MRT_ColumnDef<Activity>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        Cell: ({ row: { original } }) => (
          <span
            className={`text-center rounded-sm ${
              new Date(original.create_date).toLocaleTimeString() !==
              new Date(original.last_modified_date).toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {original.id}
          </span>
        ),
      },

      {
        accessorKey: "client.id",
        header: "Client Id",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "account_id",
        header: "Account Id",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        accessorFn: (params) =>
          `${params.client?.currency?.symbol ?? ""} ${FormatNumberWithFixed(
            params.amount
          )}`,
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "note",
        header: "Note",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },

      {
        accessorKey: "client.username",
        header: "Username",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "create_date",

        header: "Create Date",
        accessorFn: (e) => new Date(e.create_date).toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "last_modified_date",

        header: "Modified Date",
        accessorFn: (e) => new Date(e.last_modified_date).toLocaleDateString(),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
    ],
    []
  );
  const table = useMaterialReactTable({
    columns,
    data: props.data,
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

    renderRowActionMenuItems({
      row: {
        original: { id, description },
      },
    }) {
      return [
        <Authorized key={1} permission={"Edit_Activity"}>
          <Link href={"/admin/accounting/entry" + "/form?activity_id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
        </Authorized>,
        <Authorized key={2} permission={"Delete_Activity"}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to delete ${description} id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  var result = await confirmActivity({
                    id: id,
                    status: ActivityStatus.Closed,
                  });
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
      <ExportData data={props.data} table={table} />
    ),

    state: {
      showLoadingOverlay: isPadding,
    },
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
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },
  });
  return (
    <Card variant="outlined">
      <CardHeader
        title={<Typography variant="h5">Activies Table</Typography>}
      />

      <MaterialReactTable table={table} />
    </Card>
  );
}
const columnHelper = createMRTColumnHelper<Activity>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    Cell: ({ row: { original } }) => (
      <span
        className={`text-center rounded-sm ${
          new Date(original.create_date).toLocaleTimeString() !==
          new Date(original.last_modified_date).toLocaleTimeString()
            ? "bg-yellow-400"
            : ""
        }`}
      >
        {original.id}
      </span>
    ),
  }),

  columnHelper.accessor("client.id", {
    header: "Client Id",
  }),

  columnHelper.accessor("account_id", {
    header: "Account Id",
  }),

  columnHelper.accessor("type", {
    header: "Type",
  }),

  columnHelper.accessor(
    (row) =>
      `${row.client?.currency?.symbol ?? ""} ${FormatNumberWithFixed(
        row.amount
      )}`,
    {
      id: "amount",
      header: "Amount",
    }
  ),

  columnHelper.accessor("description", {
    header: "Description",
  }),
  columnHelper.accessor("note", {
    header: "Note",
  }),
  columnHelper.accessor("client.username", {
    header: "Username",
  }),

  columnHelper.accessor(
    (row) => new Date(row.create_date).toLocaleDateString(),
    {
      id: "create_date",
      header: "Create Date",
    }
  ),
  columnHelper.accessor(
    (row) => new Date(row.create_date).toLocaleDateString(),
    {
      id: "last_modified_date",
      header: "Modified Date",
    }
  ),
];
