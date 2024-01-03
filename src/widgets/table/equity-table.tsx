"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { deleteEquityById, resetEquity } from "@rms/service/equity-service";
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
import Loading from "@rms/components/ui/loading";
import EquityChart from "../chart/equity-chart";
import LoadingClient from "@rms/components/other/loading-client";

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
const columnHelper = createMRTColumnHelper<CommonPayload>();

export default function BoxTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
  const historyTablePageStore = useHistoryStore<MRT_PaginationState>(
    "equity-table-page",
    { pageIndex: 0, pageSize: 50 }
  )();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => (
          <span
            className={`text-center rounded-sm ${
              row.create_date.toLocaleTimeString() !==
              row.modified_date.toLocaleTimeString()
                ? "bg-yellow-400"
                : ""
            }`}
          >
            {row.id}
          </span>
        ),
        {
          id: "id",

          header: "ID",
        }
      ),
      columnHelper.accessor("description", { header: "Description" }),
      columnHelper.accessor((row) => row.to_date.toLocaleDateString(), {
        id: "to_date",

        header: "To Date",
      }),
      columnHelper.accessor(
        (row) => {
          var starting_float = 0,
            current_float = 0,
            closed_p_l = 0;
          row.coverage_boxes.map((res) => {
            current_float += res.current_float;
            closed_p_l += res.closed_p_l;
            starting_float += res.starting_float;
          });

          return `$${FormatNumberWithFixed(
            current_float - starting_float + closed_p_l
          )}`;
        },
        {
          id: "coverage_boxes",
          header: "Total Coverage",
        }
      ),

      columnHelper.accessor(
        (row) => {
          var starting_float = 0,
            current_float = 0,
            commission = 0,
            p_l = 0,
            swap = 0;
          row.manager_boxes.map((res, i) => {
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
        {
          id: "manager_boxes",
          header: "Total Clients",
        }
      ),
      columnHelper.accessor(
        (row) => {
          var commission = 0;
          row.agent_boxes.map((res, i) => {
            commission += res.commission;
          });

          return `$${FormatNumberWithFixed(commission)}`;
        },
        {
          id: "agent_boxes",
          header: "Total Agent",
        }
      ),
      columnHelper.accessor(
        (row) => {
          var p_l = 0;
          row.p_l.map((res, i) => {
            p_l += res.p_l;
          });

          return `$${FormatNumberWithFixed(p_l)}`;
        },
        {
          id: "p_l",
          header: " Total P&L",
        }
      ),

      columnHelper.accessor(
        (row) => {
          var expensive = 0;
          row.expensive_box.map((res, i) => {
            expensive += res.expensive;
          });

          return `$${FormatNumberWithFixed(expensive)}`;
        },
        {
          id: "expensive_box",
          header: "Total Expensive",
        }
      ),
      columnHelper.accessor(
        (row) => {
          var adjustment = 0;
          row.adjustment_boxes.map((res, i) => {
            adjustment += res.adjustment;
          });

          return `$${FormatNumberWithFixed(adjustment)}`;
        },
        {
          id: "adjustment_boxes",
          header: "Total Adjustments",
        }
      ),
      columnHelper.accessor(
        (row) => {
          var credit = 0;
          row.credit_boxes.map((res, i) => {
            credit += res.credit;
          });

          return `$${FormatNumberWithFixed(credit)}`;
        },
        {
          id: "credit_boxes",
          header: "Total Credites",
        }
      ),
      columnHelper.accessor((e) => {}, {
        id: "net_profit",
        header: "NetProfit",
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
            <span
              className={`${
                total >= 0 ? "bg-green-400" : "bg-red-400"
              } font-bold p-1 border rounded-md`}
            >
              ${FormatNumberWithFixed(total)}
            </span>
          );
        },
      }),
    ],
    []
  );
  const table = useMaterialReactTable({
    columns,
    data: props.boxes,
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
        original: { id, to_date },
      },
    }) {
      return [
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
        <Authorized permission={"Reset"} key={2}>
          <MenuItem
            disabled={isPadding}
            className="cursor-pointer"
            onClick={() => {
              const isConfirm = confirm(
                `Do You sure you want to reset  id:${id} `
              );
              if (isConfirm) {
                setTransition(async () => {
                  const result = await resetEquity(id);

                  toast.OpenAlert(result);
                });
              }
            }}
          >
            {isPadding ? <> reseting...</> : "Reset"}
          </MenuItem>
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
                setTransition(async () => {
                  const result = await deleteEquityById(id);

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

    onPaginationChange: historyTablePageStore.set,
    state: {
      showLoadingOverlay: isPadding,
      pagination: historyTablePageStore.data,
    },

    initialState: {
      density: "comfortable",
    },
  });
  const { coverage } = useMemo(() => {
    var coverage = 0,
      manager = 0,
      agent = 0,
      p_l = 0,
      expensive = 0,
      adjustment = 0,
      credit = 0;
    var total = 0;

    table.getCoreRowModel().rows.forEach((row) => {
      coverage += parseFloat(
        (row.getAllCells()[4].getValue() as string).replace(/[$,]/g, "")
      );
      manager += parseFloat(
        (row.getAllCells()[5].getValue() as string).replace(/[$,]/g, "")
      );
      agent += parseFloat(
        (row.getAllCells()[6].getValue() as string).replace(/[$,]/g, "")
      );
      p_l += parseFloat(
        (row.getAllCells()[7].getValue() as string).replace(/[$,]/g, "")
      );
      expensive += parseFloat(
        (row.getAllCells()[8].getValue() as string).replace(/[$,]/g, "")
      );
      adjustment += parseFloat(
        (row.getAllCells()[9].getValue() as string).replace(/[$,]/g, "")
      );
      credit += parseFloat(
        (row.getAllCells()[10].getValue() as string).replace(/[$,]/g, "")
      );

      total +=
        coverage - manager - agent + p_l - expensive - adjustment - credit;
    });

    return {
      coverage: FormatNumberWithFixed(coverage),
    };
  }, [table]);

  return loading ? (
    <Loading></Loading>
  ) : (
    <div className="w-full flex flex-col gap-5">
      <div className="border p-5 flex gap-2 flex-col rounded-lg">
        <Typography variant="h6">Total Coverage</Typography>
        <Typography variant="h5" className="text-end">
          ${coverage}
        </Typography>
      </div>
      <EquityChart />
      <Card variant="outlined">
        <CardHeader
          title={<Typography variant="h5">Equity Table</Typography>}
        />
        <LoadingClient>
          <MaterialReactTable table={table} />
        </LoadingClient>{" "}
      </Card>
    </div>
  );
}
