"use client";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Input from "@mui/joy/Input";

import { Stack } from "@mui/joy";
import { $Enums } from "@prisma/client";
import NexCiteButton from "@nexcite/components/button/nexcite-button";
import NexCiteCard from "@nexcite/components/card/nexcite-card";
import { IChartOfAccountGrouped } from "@nexcite/Interfaces/IChartOfAccount";
import {
  BalanceSheetTotal,
  exportToExcel,
  FormatNumberWithFixed,
} from "@nexcite/lib/global";
import ChartOfAccountGrouped from "@nexcite/models/ChartOfAccountModel";
import dayjs from "dayjs";
import {
  createMRTColumnHelper,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AiFillFileExcel } from "react-icons/ai";

type Props = {
  accountId?: string;
  accountType?: $Enums.AccountType;
  onDateChange?: (from: Date, to: Date) => void;
  data: IChartOfAccountGrouped[];
  currencies?: {
    id?: number;
    name?: string;
    symbol?: string;
    rate?: number;
  }[];
  currency?: {
    id?: number;
    name?: string;
    symbol?: string;
    rate?: number;
  };
};

export default function BalanceSheetTableTest(props: Props) {
  const serachParams = useSearchParams();
  const dateSearchParams = useMemo(() => {
    const from = serachParams.get("from");
    const to = serachParams.get("to");
    if (from && to) {
      return {
        from: dayjs(from).startOf("d").toDate(),
        to: dayjs(to).endOf("d").toDate(),
      };
    } else {
      return {
        from: dayjs().startOf("month").toDate(),
        to: dayjs().endOf("month").toDate(),
      };
    }
  }, [serachParams]);
  const [selectData, setSelectData] = useState(dateSearchParams);
  const [isPadding, setTransition] = useTransition();
  const columns = useMemo(
    () => [
      columnGroupedDataHelper.accessor("id", {
        header: "ID",
        enableGrouping: false,
      }),
      columnGroupedDataHelper.accessor("name", {
        header: "Name",
        enableGrouping: false,
      }),

      columnGroupedDataHelper.accessor("class", {
        filterVariant: "multi-select",
        filterSelectOptions: Array.from({ length: 9 }).map((res, i) => i + ""),
        GroupedCell: ({ row, cell }) => {
          return <span>{cell.getValue()}</span>;
        },
        header: "Class",
      }),
      columnGroupedDataHelper.accessor(undefined, {
        id: "total",
        header: "Total",
        Cell: ({ row: { original } }) => {
          const total = BalanceSheetTotal(original);

          return (
            <span
              style={{
                color: total > 0 ? "green" : "red",
              }}
            >
              {original.currency?.symbol ?? "$"}
              {FormatNumberWithFixed(total * (original.currency?.rate ?? 1), 3)}
            </span>
          );
        },
      }),
    ],
    []
  );
  const table = useMaterialReactTable({
    columns,
    data: props.data,
    state: {
      showLoadingOverlay: isPadding,
    },
    muiTableProps: { id: "BalanceSheetTable" },
    enableExpanding: true,
    muiTableContainerProps: { sx: { maxHeight: "auto" } },
    enableStickyHeader: true,
    enablePagination: false,
  });
  const { replace } = useRouter();

  return (
    <NexCiteCard title="Balance Sheet">
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems="end"
        justifyContent={"space-between"}
        spacing={2}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="end"
          spacing={2}
        >
          <FormControl sx={{}}>
            <FormLabel>From</FormLabel>
            <Input
              fullWidth
              type="date"
              value={dayjs(selectData.from).format("YYYY-MM-DD")}
              onChange={(e) => {
                setSelectData((prev) => ({
                  ...prev,
                  from: e.target.valueAsDate,
                }));
              }}
            />
          </FormControl>
          <FormControl sx={{}}>
            <FormLabel>To</FormLabel>
            <Input
              fullWidth
              type="date"
              value={dayjs(selectData.to).format("YYYY-MM-DD")}
              onChange={(e) => {
                setSelectData((prev) => ({
                  ...prev,
                  to: e.target.valueAsDate,
                }));
              }}
            />
          </FormControl>

          <NexCiteButton
            isPadding={isPadding}
            onClick={(e) => {
              setTransition(() => {
                replace(
                  window.location.pathname +
                    `?from=${selectData.from.toLocaleDateString()}&to=${selectData.to.toLocaleDateString()}`
                );
              });
            }}
          >
            Search
          </NexCiteButton>
        </Stack>
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="end"
          spacing={2}
        >
          {" "}
          <NexCiteButton
            icon={<AiFillFileExcel />}
            onClick={(e) => {
              setTransition(() => {
                exportToExcel({
                  sheet: "BalanceSheet",
                  id: "BalanceSheetTable",
                  fileName: "BalanceSheet",
                });
              });
            }}
          >
            Export Excel
          </NexCiteButton>
        </Stack>
      </Stack>
      <MaterialReactTable table={table} />
    </NexCiteCard>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<ChartOfAccountGrouped>();
