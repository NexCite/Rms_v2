"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import Link from "next/link";
import { deleteEquityById } from "@rms/service/equity-service";

type CommonPayload = Prisma.EquityGetPayload<{
  include: {
    agent_boxes: true;
    coverage_boxes: true;
    expensive_box: true;
    manager_boxes: true;
    p_l: true;
    adjustment_boxes: true;
    credit_boxes: true;
  };
}>;
type Props = {
  boxes: CommonPayload[];
};

export default function BoxTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setPadding] = useTransition();
  const store = useStore();

  const columns = useMemo<MRT_ColumnDef<CommonPayload>[]>(
    () => [
      {
        accessorKey: "id",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
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
      },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "to_date",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "To Date",
        accessorFn: (e) => e.to_date.toLocaleDateString(),
      },
      {
        accessorKey: "coverage_boxes",
        header: "Total Coverage",

        accessorFn(originalRow) {
          var starting_float = 0,
            current_float = 0,
            closed_p_l = 0;
          originalRow.coverage_boxes.map((res) => {
            current_float += res.current_float;
            closed_p_l += res.closed_p_l;
            starting_float += res.starting_float;
          });

          return `$${FormatNumberWithFixed(
            current_float - starting_float + closed_p_l
          )}`;
        },
      },

      {
        accessorKey: "manager_boxes",
        header: "Total Clients",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        accessorFn(originalRow) {
          var starting_float = 0,
            current_float = 0,
            commission = 0,
            p_l = 0,
            swap = 0;
          originalRow.manager_boxes.map((res, i) => {
            current_float += res.current_float;
            p_l += res.p_l;
            starting_float += res.starting_float;
            commission += res.commission;
            swap += res.swap;
          });

          return `$${FormatNumberWithFixed(
            current_float - starting_float + p_l + commission + swap
          )}`;
        },
      },
      {
        accessorKey: "agent_boxes",
        header: "Total Agent",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        accessorFn(originalRow) {
          var commission = 0;
          originalRow.agent_boxes.map((res, i) => {
            commission += res.commission;
          });

          return `$${FormatNumberWithFixed(commission)}`;
        },
      },
      {
        accessorKey: "p_l",
        header: " Total P&L",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        accessorFn(originalRow) {
          var p_l = 0;
          originalRow.p_l.map((res, i) => {
            p_l += res.p_l;
          });

          return `$${FormatNumberWithFixed(p_l)}`;
        },
      },

      {
        accessorKey: "expensive_box",
        header: "Total Expensive",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        accessorFn(originalRow) {
          var expensive = 0;
          originalRow.expensive_box.map((res, i) => {
            expensive += res.expensive;
          });

          return `$${FormatNumberWithFixed(expensive)}`;
        },
      },
      {
        accessorKey: "adjustment_boxes",
        header: "Total Adjustments",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        accessorFn(originalRow) {
          var adjustment = 0;
          originalRow.adjustment_boxes.map((res, i) => {
            adjustment += res.adjustment;
          });

          return `$${FormatNumberWithFixed(adjustment)}`;
        },
      },
      {
        accessorKey: "credit_boxes",
        header: "Total Credites",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        accessorFn(originalRow) {
          var credit = 0;
          originalRow.credit_boxes.map((res, i) => {
            credit += res.credit;
          });

          return `$${FormatNumberWithFixed(credit)}`;
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },

        Cell(props) {
          const coverage = parseFloat(
              (props.row.getAllCells()[4].getValue() as string).replace(
                /[$,]/g,
                ""
              )
            ),
            manager = parseFloat(
              (props.row.getAllCells()[5].getValue() as string).replace(
                /[$,]/g,
                ""
              )
            ),
            agent = parseFloat(
              (props.row.getAllCells()[6].getValue() as string).replace(
                /[$,]/g,
                ""
              )
            ),
            p_l = parseFloat(
              (props.row.getAllCells()[7].getValue() as string).replace(
                /[$,]/g,
                ""
              )
            ),
            expensive = parseFloat(
              (props.row.getAllCells()[8].getValue() as string).replace(
                /[$,]/g,
                ""
              )
            ),
            adjustment = parseFloat(
              (props.row.getAllCells()[9].getValue() as string).replace(
                /[$,]/g,
                ""
              )
            ),
            credit = parseFloat(
              (props.row.getAllCells()[10].getValue() as string).replace(
                /[$,]/g,
                ""
              )
            );

          const total =
            coverage - manager - agent + p_l - expensive - adjustment - credit;

          return (
            <div
              className={`${
                total >= 0 ? "bg-green-400" : "bg-red-400"
              } font-bold p-1 border rounded-md`}
            >
              ${FormatNumberWithFixed(total)}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <Card>
        <CardHeader
          title={<Typography variant="h5">Equities Table</Typography>}
        />

        <MaterialReactTable
          state={{ showProgressBars: isPadding }}
          enableRowActions
          columns={columns}
          renderRowActionMenuItems={({
            row: {
              original: { id, to_date },
            },
          }) => [
            <Authorized permission="Edit_Equity" key={1}>
              <Link href={pathName + "/form?id=" + id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  Edit
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="View_Equity" key={2}>
              <Link href={pathName + "/" + id}>
                <MenuItem className="cursor-pointer" disabled={isPadding}>
                  View
                </MenuItem>
              </Link>
            </Authorized>,
            <Authorized permission="Delete_Equity" key={3}>
              <MenuItem
                disabled={isPadding}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete ${to_date.toDateString()} id:${id} `
                  );
                  if (isConfirm) {
                    setPadding(async () => {
                      const result = await deleteEquityById(id);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isPadding ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
          data={props.boxes}
        />
      </Card>
    </div>
  );
}
