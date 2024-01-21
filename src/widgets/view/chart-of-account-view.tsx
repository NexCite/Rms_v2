"use client";

import MoreHoriz from "@mui/icons-material/MoreHoriz";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Dropdown,
  FormControl,
  FormLabel,
  Menu,
  MenuButton,
  MenuItem,
  Tab,
  TabList,
  Table,
  Tabs,
  Typography,
} from "@mui/joy";
import { Prisma } from "@prisma/client";
import Authorized from "@rms/components/other/authorized";
import {
  FormatNumberWithFixed,
  VoucherSchema,
  exportToExcel,
} from "@rms/lib/global";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AiFillFileExcel } from "react-icons/ai";
import BalanceSheetTable from "../table/balance-sheet-table";
type Props = {
  id: string;
  chartOfAccount: Prisma.ChartOfAccountGetPayload<{
    include: {
      currency: true;
      voucher_items: {
        include: {
          currency: true;
          chart_of_account: true;
          reference_chart_of_account: true;
        };
      };
    };
  }>;

  chartOfAccounts: Prisma.ChartOfAccountGetPayload<{}>[];
  vouchers: Prisma.VoucherGetPayload<{
    include: {
      currency: true;
      voucher_items: {
        include: {
          currency: true;
          chart_of_account: true;
          reference_chart_of_account: true;
        };
      };
    };
  }>[];
};

export default function ChartOfAccountView(props: Props) {
  const [selectedChartOfAccounts, setSelectedChartOfAccounts] = useState<
    typeof props.chartOfAccounts
  >([]);
  const columns = useMemo(
    () => [
      columnGroupedDataHelper.accessor("id", { header: "ID" }),
      columnGroupedDataHelper.accessor("title", { header: "Title" }),
      columnGroupedDataHelper.accessor("currency.symbol", {
        header: "Currency",
      }),
      columnGroupedDataHelper.accessor(
        (row) => row.to_date.toLocaleDateString(),
        {
          header: "Date",
          id: "date",
        }
      ),
    ],
    [props.chartOfAccount.currency]
  );
  const filtedVoucher = useMemo(() => {
    if (selectedChartOfAccounts.length == 0) return props.vouchers;
    return props.vouchers.filter((res) => {
      let isFound = false;
      res.voucher_items.forEach((res) => {
        if (
          selectedChartOfAccounts.find((res2) =>
            res.chart_of_account_id.startsWith(res2.id)
          )
        ) {
          isFound = true;
        }
      });
      return isFound;
    });
  }, [selectedChartOfAccounts, props.vouchers]);
  const table = useMaterialReactTable({
    columns,
    muiTableProps: {
      id: "chart-of-account-table-account",
    },

    data: filtedVoucher ?? [],
  });

  const { credit, debit } = useMemo(() => {
    let debit: number = 0,
      credit: number = 0;
    filtedVoucher?.forEach((res) => {
      res.voucher_items.forEach((res) => {
        if (
          res.chart_of_account_id === props.id ||
          res.reffrence_chart_of_account_id === props.id
        ) {
          if (res.debit_credit == "Debit") {
            debit += res.amount / res.currency.rate;
          } else {
            credit += res.amount / res.currency.rate;
          }
        }
      });
    });
    return { debit, credit };
  }, [props.id, filtedVoucher]);

  const [activeTab, setActiveTab] = useState(0);
  return (
    <>
      <Card>
        <CardContent>
          <Typography level="h2">Account Details</Typography>
          <div className="overflow-x-auto w-full">
            <Table size="lg" stickyHeader className="w-screen">
              <thead>
                <tr>
                  <th></th>
                  <th>Account ID</th>
                  <th>Account Name</th>
                  <th>Type</th>
                  <th>Debit/Credit</th>
                  <th>Currency</th> <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Account Type</th>
                  <th>Business ID</th>
                  <th>Limit Amount</th>
                  <th>Country</th>
                  <th>Address</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <Dropdown>
                      <MenuButton>
                        <MoreHoriz />
                      </MenuButton>
                      <Menu>
                        <Authorized permission="Update_Chart_Of_Account">
                          <MenuItem>
                            <Link
                              href={
                                "/admin/accounting/chart_of_account/form?id=" +
                                props.id
                              }
                            >
                              Edit
                            </Link>
                          </MenuItem>
                        </Authorized>
                      </Menu>
                    </Dropdown>
                  </td>
                  <td>{props.chartOfAccount.id}</td>
                  <td>{props.chartOfAccount.name}</td>
                  <td>{props.chartOfAccount.chart_of_account_type}</td>
                  <td>{props.chartOfAccount.debit_credit}</td>
                  <td>{props.chartOfAccount.currency?.name}</td>
                  <td>{props.chartOfAccount.id}</td>
                  <td>{props.chartOfAccount.name}</td>
                  <td>{props.chartOfAccount.chart_of_account_type}</td>
                  <td>{props.chartOfAccount.debit_credit}</td>
                  <td>{props.chartOfAccount.currency?.name}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Tabs
        onChange={(e, v) => {
          setActiveTab(v as any);
        }}
        aria-label="Basic tabs"
        value={activeTab}
      >
        <TabList>
          <Tab>Voucher Table</Tab>
          <Tab>Chart Of Account Table</Tab>
        </TabList>
        <div
          className={`${activeTab == 0 ? "p-5 flex flex-col gap-5" : "hidden"}`}
        >
          <div className="grid grid-cols-1   lg:grid-cols-3 gap-5">
            <Card variant="outlined" invertedColors>
              <CardContent orientation="horizontal">
                <CardContent>
                  <Typography level="body-md">Total Debit</Typography>
                  <Typography level="h2">
                    {props.chartOfAccount.currency?.symbol ?? "$"}
                    {FormatNumberWithFixed(
                      debit * (props.chartOfAccount.currency?.rate ?? 1),
                      2
                    )}
                  </Typography>
                </CardContent>
              </CardContent>
            </Card>
            <Card variant="outlined" invertedColors>
              <CardContent orientation="horizontal">
                <CardContent>
                  <Typography level="body-md">Total Credit</Typography>
                  <Typography level="h2">
                    {props.chartOfAccount.currency?.symbol ?? "$"}
                    {FormatNumberWithFixed(
                      credit * (props.chartOfAccount.currency?.rate ?? 1),
                      2
                    )}
                  </Typography>
                </CardContent>
              </CardContent>
            </Card>
            <Card variant="outlined" invertedColors>
              <CardContent orientation="horizontal">
                <CardContent>
                  <Typography level="body-md">Total</Typography>
                  <Typography level="h2">
                    {debit - credit > 0 ? "Debit" : "Credit"}{" "}
                    {props.chartOfAccount.currency?.symbol ?? "$"}
                    {FormatNumberWithFixed(
                      (debit - credit) *
                        (props.chartOfAccount.currency?.rate ?? 1),
                      2
                    )}
                  </Typography>
                </CardContent>
              </CardContent>
            </Card>
          </div>
          <div className="flex gap-5   flex-col justify-between w-full">
            <FormControl className="w-full">
              <FormLabel>Chartd of Accounts</FormLabel>
              <Autocomplete
                // isOptionEqualToValue={(e) =>
                //   e.id ===
                //   props.chartOfAccounts.find((res) => res.id === e.id)?.id
                // }
                className="w-full"
                name="chart_of_accounts"
                disableCloseOnSelect
                options={props.chartOfAccounts}
                value={selectedChartOfAccounts}
                getOptionLabel={(option: any) => `${option.id} ${option.name}`}
                onChange={(e, newValue) => {
                  setSelectedChartOfAccounts(newValue as any);
                }}
                multiple
                placeholder="chart of accounts"
              />{" "}
            </FormControl>
            <div className="flex justify-between">
              <Button
                className="nexcite-btn sm:w-full md:w-fit"
                startDecorator={<AiFillFileExcel />}
                onClick={(e) => {
                  exportToExcel({
                    sheet: "chart of account",
                    id: "chart-of-account-table-account",
                  });
                }}
              >
                Export Excel
              </Button>
            </div>
          </div>
          <div className="flex-col md:flex-row flex justify-between items-center gap-5"></div>
          <MaterialReactTable table={table} />
        </div>
        <div className={`${activeTab == 1 ? "" : "hidden"} p-5`}>
          <BalanceSheetTable
            currency={props.chartOfAccount.currency}
            accountId={props.id}
          />
        </div>
      </Tabs>
    </>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<VoucherSchema>();
