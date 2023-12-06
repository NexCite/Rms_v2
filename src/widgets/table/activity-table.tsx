"use client";

import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { Activity, ActivityStatus } from "@rms/models/CommonModel";
import { confirmActivity } from "@rms/service/activity-service";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import Link from "next/link";

type Props = {
  data: Activity[];
};

export default function ActivityTable(props: Props) {
  const [isPadding, setTransition] = useTransition();

  const store = useStore();

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
  return (
    <Card variant="outlined">
      <CardHeader
        title={<Typography variant="h5">Activies Table</Typography>}
      />

      <MaterialReactTable
        initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
        state={{ showProgressBars: isPadding }}
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, description },
          },
        }) => [
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
                    store.OpenAlert(result);
                  });
                }
              }}
            >
              {isPadding ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.data}
      />
    </Card>
  );
}
