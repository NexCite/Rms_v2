"use client";

import { Prisma } from "@prisma/client";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { MenuItem } from "@mui/material";
import Authorized from "@nexcite/components/other/Authorized";
import { useToast } from "@nexcite/hooks/toast-hook";
import { FormatNumberWithFixed } from "@nexcite/lib/global";
import { deleteCurrency } from "@nexcite/service/currency-service";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";

import NexCiteCard from "@nexcite/components/card/NexCiteCard";

type Props = {
  currencies: Prisma.CurrencyGetPayload<{}>[];
};

export default function CurrencyTable(props: Props) {
  const pathName = usePathname();
  const [isPadding, setTransition] = useTransition();
  const toast = useToast();

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

    state: {
      showLoadingOverlay: isPadding,
    },

    editDisplayMode: "row",

    renderRowActionMenuItems({
      row: {
        original: { name, id },
      },
    }) {
      return [
        <Authorized permission="Update_Currency" key={1}>
          <Link href={pathName + "/form?id=" + id}>
            <MenuItem className="cursor-pointer" disabled={isPadding}>
              Edit
            </MenuItem>
          </Link>
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
  });

  return (
    <NexCiteCard title="Currency Table">
      <MaterialReactTable table={table} />
    </NexCiteCard>
  );
}

const columnsHelper = createMRTColumnHelper<Prisma.CurrencyGetPayload<{}>>();
const columns = [
  columnsHelper.accessor("id", {
    header: "ID",
  }),
  columnsHelper.accessor("name", {
    header: "Name",
  }),
  columnsHelper.accessor("symbol", {
    header: "Symbol",
  }),

  columnsHelper.accessor("rate", {
    header: "Rate",
    Cell(props) {
      return FormatNumberWithFixed(props.row.original.rate, 2);
    },
  }),
];
