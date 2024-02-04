"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl, FormLabel, Input } from "@mui/joy";
import { MenuItem } from "@mui/material";
import NexCiteButton from "@nexcite/components/button/nexcite-button";
import NexCiteCard from "@nexcite/components/card/nexcite-card";
import Authorized from "@nexcite/components/other/authorized";
import { useToast } from "@nexcite/hooks/toast-hook";
import { FormatNumberWithFixed, exportToExcel } from "@nexcite/lib/global";
import { Search } from "@nexcite/schema/search-schema";
import {
  deleteEquityById,
  findEquities,
} from "@nexcite/service/equity-service";
import dayjs from "dayjs";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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
type Props = {};

const schema = z.object({});
export default function EquityTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setPadding] = useTransition();
  const form = useForm<Search>({
    resolver: zodResolver(schema),
    defaultValues: {
      from: dayjs().startOf("year").toDate(),
      to: dayjs().endOf("year").toDate(),
    },
  });

  const toast = useToast();

  const [data, setData] = useState<CommonPayload[]>([]);

  useEffect(() => {
    setPadding(async () => {
      findEquities(form.getValues() as any).then((data) => {
        setData(data.result);
      });
    });
  }, [form]);
  const onSubmit = useCallback((data: Search) => {
    setPadding(async () => {
      findEquities(data as any).then((data) => {
        setData(data.result);
      });
    });
  }, []);

  return (
    <NexCiteCard title="Equity Table">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-4 gap-3 items-end"
      >
        <Controller
          name="from"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormControl className="w-full" error={Boolean(fieldState.error)}>
              <FormLabel>From Date</FormLabel>
              <Input
                type="date"
                value={dayjs(field.value).format("YYYY-MM-DD")}
                onChange={(e) => {
                  field.onChange(
                    dayjs(e.target.valueAsDate).startOf("d").toDate()
                  );
                }}
              />
            </FormControl>
          )}
        />

        <Controller
          name="to"
          control={form.control}
          render={({ field, fieldState }) => (
            <FormControl className="w-full" error={Boolean(fieldState.error)}>
              <FormLabel>To Date</FormLabel>
              <Input
                type="date"
                value={dayjs(field.value).format("YYYY-MM-DD")}
                onChange={(e) => {
                  field.onChange(
                    dayjs(e.target.valueAsDate).startOf("d").toDate()
                  );
                }}
              />
            </FormControl>
          )}
        />
        <NexCiteButton className="w-full lg:h-[20px] " isPadding={isPadding}>
          Search
        </NexCiteButton>
        <NexCiteButton
          className="w-full lg:h-[20px] "
          type="button"
          onClick={(e) => {
            const { from, to } = form.getValues();
            exportToExcel({
              to: from,
              from: to,
              sheet: "Equity",
              id: "equity-table",
            });
          }}
        >
          Export Excel
        </NexCiteButton>
      </form>
      <MaterialReactTable
        muiTableProps={{ id: "equity-table" }}
        initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
        state={{ showLoadingOverlay: isPadding }}
        enableRowActions
        columns={columns}
        renderRowActionMenuItems={({
          row: {
            original: { id, to_date },
          },
        }) => [
          <Authorized permission="Update_Equity" key={1}>
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
                    toast.OpenAlert(result);
                    //   store.OpenAlert(result);
                  });
                }
              }}
            >
              {isPadding ? <> deleting...</> : "Delete"}
            </MenuItem>
          </Authorized>,
        ]}
        data={data}
      />
    </NexCiteCard>
  );
}
const columns: MRT_ColumnDef<CommonPayload>[] = [
  {
    accessorKey: "id",
    muiTableHeadCellProps: {
      align: "center",
    },
    muiTableBodyCellProps: {
      align: "center",
    },
    header: "ID",
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
      const total = originalRow.coverage_boxes.reduce((a, b) => {
        return a + b.current_float - b.starting_float + b.closed_p_l;
      }, 0);

      return FormatNumberWithFixed(total, 2);
    },
    Cell(props) {
      return <span> ${props.cell.getValue() as string}</span>;
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
      const total = originalRow.manager_boxes.reduce((a, b) => {
        return (
          a + b.starting_float - b.current_float + b.commission + b.p_l + b.swap
        );
      }, 0);

      return FormatNumberWithFixed(total, 2);
    },
    Cell(props) {
      return <span> ${props.cell.getValue() as string}</span>;
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
      const total = originalRow.agent_boxes.reduce((a, b) => {
        return a + b.commission;
      }, 0);

      return FormatNumberWithFixed(total, 2);
    },
    Cell(props) {
      return <span> ${props.cell.getValue() as string}</span>;
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
      const total = originalRow.p_l.reduce((a, b) => {
        return a + b.p_l;
      }, 0);

      return FormatNumberWithFixed(total, 2);
    },
    Cell(props) {
      return <span> ${props.cell.getValue() as string}</span>;
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
      const total = originalRow.expensive_box.reduce((a, b) => {
        return a + b.expensive;
      }, 0);

      return FormatNumberWithFixed(total, 2);
    },
    Cell(props) {
      return <span> ${props.cell.getValue() as string}</span>;
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
      const total = originalRow.adjustment_boxes.reduce((a, b) => {
        return a + b.adjustment;
      }, 0);

      return FormatNumberWithFixed(total);
    },
    Cell(props) {
      return <span> ${props.cell.getValue() as string}</span>;
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
      const total = originalRow.credit_boxes.reduce((a, b) => {
        return a + b.credit;
      }, 0);

      return FormatNumberWithFixed(total);
    },
    Cell(props) {
      return <span> ${props.cell.getValue() as string}</span>;
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
          (props.row.getAllCells()[4].getValue() as string).replace(/[$,]/g, "")
        ),
        manager = parseFloat(
          (props.row.getAllCells()[5].getValue() as string).replace(/[$,]/g, "")
        ),
        agent = parseFloat(
          (props.row.getAllCells()[6].getValue() as string).replace(/[$,]/g, "")
        ),
        p_l = parseFloat(
          (props.row.getAllCells()[7].getValue() as string).replace(/[$,]/g, "")
        ),
        expensive = parseFloat(
          (props.row.getAllCells()[8].getValue() as string).replace(/[$,]/g, "")
        ),
        adjustment = parseFloat(
          (props.row.getAllCells()[9].getValue() as string).replace(/[$,]/g, "")
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
  },
];
