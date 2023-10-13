"use client";

import { Prisma } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

import { Card, CardHeader, MenuItem, Typography } from "@mui/material";
import Authorized from "@rms/components/ui/authorized";
import { deleteCurrency } from "@rms/service/currency-service";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { useStore } from "@rms/hooks/toast-hook";

type Props = {
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

export default function CurrencyTable(props: Props) {
  const pathName = usePathname();
  const [isActive, setActiveTransition] = useTransition();
  const store = useStore();

  const { push } = useRouter();

  const columns = useMemo<MRT_ColumnDef<Prisma.CurrencyGetPayload<{}>>[]>(
    () => [
      {
        header: "Status",
        accessorKey: "status",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
      },

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
      { accessorKey: "name", header: "Name" },
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
    ],
    []
  );

  return (
    <div className="w-full">
      <Card>
        <CardHeader
          title={<Typography variant="h5">Currency Table</Typography>}
        />

        <MaterialReactTable
          enableRowActions
          columns={columns}
          renderRowActionMenuItems={({
            row: {
              original: { id, name },
            },
          }) => [
            <Authorized permission="Edit_Currency" key={1}>
              <MenuItem
                onClick={() => push(pathName + "/form?id=" + id)}
                className="cursor-pointer"
                disabled={isActive}
              >
                Edit
              </MenuItem>
            </Authorized>,

            <Authorized permission="Delete_Currency" key={3}>
              <MenuItem
                disabled={isActive}
                className="cursor-pointer"
                onClick={() => {
                  const isConfirm = confirm(
                    `Do You sure you want to delete ${name} id:${id} `
                  );
                  if (isConfirm) {
                    setActiveTransition(async () => {
                      const result = await deleteCurrency(id);

                      store.OpenAlert(result);
                    });
                  }
                }}
              >
                {isActive ? <> deleting...</> : "Delete"}
              </MenuItem>
            </Authorized>,
          ]}
          data={props.currencies}
        />
      </Card>
    </div>
  );
}
