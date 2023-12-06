"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { useStore } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { deleteCurrency, resetCurrency } from "@rms/service/currency-service";
import { MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Link from "next/link";

type Props = {
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

export default function CurrencyTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const store = useStore();

  const columns = useMemo<MRT_ColumnDef<Prisma.CurrencyGetPayload<{}>>[]>(
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
      {
        accessorKey: "name",
        header: "Name",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },
      {
        accessorKey: "symbol",
        header: "Symbol",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },

      {
        accessorKey: "create_date",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Create Date",
        accessorFn: (e) => e.create_date.toLocaleDateString(),
      },

      {
        accessorKey: "modified_date",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        header: "Create Date",
        accessorFn: (e) => e.modified_date.toLocaleDateString(),
      },
      {
        accessorKey: "rate",
        header: "Rate",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        accessorFn: (e) => e.rate && FormatNumberWithFixed(e.rate),
      },
    ],
    []
  );

  return (
    <div className="w-full">
      <Card variant="outlined">
        <CardHeader
          title={<Typography variant="h5">Currency Table</Typography>}
        />

        <MaterialReactTable
          initialState={{ pagination: { pageSize: 100, pageIndex: 0 } }}
          state={{ showProgressBars: isPadding }}
          enableRowActions
          columns={columns}
          renderRowActionMenuItems={({
            row: {
              original: { id, name },
            },
          }) => [
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

                      store.OpenAlert(result);
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

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isPadding ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
          data={props.currencies}
        />
      </Card>
    </div>
  );
}
