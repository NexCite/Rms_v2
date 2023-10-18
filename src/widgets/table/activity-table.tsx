"use client";

import { Prisma } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import {
  deleteMoreDigit,
  deleteThreeDigit,
  deleteTwoDigit,
} from "@rms/service/digit-service";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useStore } from "@rms/hooks/toast-hook";
import { Activity, ActivityStatus } from "@rms/models/CommonModel";
import { confirmActivity } from "@rms/service/activity-service";
import moment from "moment";
import { FormatNumberWithFixed } from "@rms/lib/global";
import Link from "next/link";

type Props = {
  data: Activity[];
};

export default function ActivityTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();

  const store = useStore();
  const { push } = useRouter();

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
          <div
            className={`text-center rounded-sm ${
              new Date(original.create_date).toLocaleTimeString() !==
              new Date(original.last_modified_date).toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {original.id}
          </div>
        ),
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
    <Card>
      <CardHeader
        title={<Typography variant="h5">Activies Table</Typography>}
      />

      <MaterialReactTable
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, description },
          },
        }) => [
          <Authorized key={1} permission={"Edit_Activity"}>
            <Link href={"/admin/accounting/entry" + "/form?activity_id=" + id}>
              <MenuItem className="cursor-pointer" disabled={isActive}>
                Edit
              </MenuItem>
            </Link>
          </Authorized>,
          <Authorized key={2} permission={"Delete_Activity"}>
            <MenuItem
              disabled={isActive}
              className="cursor-pointer"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete ${description} id:${id} `
                );
                if (isConfirm) {
                  setActiveTransition(async () => {
                    var result = await confirmActivity({
                      id: id,
                      status: ActivityStatus.Closed,
                    });
                    store.OpenAlert(result);
                  });
                }
              }}
            >
              {isActive ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={props.data}
      />
    </Card>
  );
}
