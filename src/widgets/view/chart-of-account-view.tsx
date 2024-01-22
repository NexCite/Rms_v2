"use client";

import MoreHoriz from "@mui/icons-material/MoreHoriz";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dropdown,
  FormControl,
  FormLabel,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  Option,
  Select,
  Stack,
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
  currencies: Prisma.CurrencyGetPayload<{}>[];

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
  const [selectedCurrency, setSelectedCurrency] = useState<
    Prisma.CurrencyGetPayload<{}>
  >(props.chartOfAccount?.currency);

  const [selectedChartOfAccounts, setSelectedChartOfAccounts] = useState<
    typeof props.chartOfAccounts
  >([]);

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
        if (
          selectedChartOfAccounts.find((res2) =>
            res.reffrence_chart_of_account_id?.startsWith(res2.id)
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
          res.chart_of_account_id.startsWith(props.id) ||
          res.reffrence_chart_of_account_id?.startsWith(props.id)
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

  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Grid xs={12}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          <FormControl sx={{}}>
            <Select
              disabled={props.chartOfAccount.currency ? true : false}
              defaultValue={selectedCurrency?.id}
            >
              {props.currencies.map((res) => {
                return (
                  <Option
                    key={res.id}
                    value={res.id}
                    onClick={(e) => {
                      setSelectedCurrency(res);
                    }}
                  >
                    {res.name}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Stack>
      </Grid>
      <Grid xs={12}>
        {" "}
        <div className="grid grid-cols-1   lg:grid-cols-3 gap-5 w-full">
          <Card variant="outlined" invertedColors>
            <CardContent orientation="horizontal">
              <CardContent>
                <Typography level="body-md">Total Debit</Typography>
                <Typography level="h2">
                  {selectedCurrency?.symbol ?? "$"}
                  {FormatNumberWithFixed(
                    debit * (selectedCurrency?.rate ?? 1),
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
                  {selectedCurrency?.symbol ?? "$"}
                  {FormatNumberWithFixed(
                    credit * (selectedCurrency?.rate ?? 1),
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
                  {selectedCurrency?.symbol ?? "$"}
                  {FormatNumberWithFixed(
                    (debit - credit) * (selectedCurrency?.rate ?? 1),
                    2
                  )}
                </Typography>
              </CardContent>
            </CardContent>
          </Card>
        </div>
      </Grid>
      <Grid>
        {" "}
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
                    <td>{selectedCurrency?.name}</td>
                    <td>{props.chartOfAccount.first_name}</td>
                    <td>{props.chartOfAccount.last_name}</td>

                    <td>{props.chartOfAccount.email}</td>
                    <td>{props.chartOfAccount.phone_number}</td>
                    <td>{props.chartOfAccount.account_type}</td>
                    <td>{props.chartOfAccount.business_id}</td>
                    <td>{props.chartOfAccount.limit_amount}</td>
                    <td>{props.chartOfAccount.country}</td>
                    <td>{props.chartOfAccount.address}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12}>
        {" "}
        <Card>
          <CardContent>
            <div className="flex gap-5   flex-col justify-between w-full">
              <FormControl className="w-full">
                <FormLabel>Chart of Accounts</FormLabel>
                <Autocomplete
                  className="w-full"
                  name="chart_of_accounts"
                  disableCloseOnSelect
                  options={props.chartOfAccounts}
                  value={selectedChartOfAccounts}
                  getOptionLabel={(option: any) =>
                    `${option.id} ${option.name} ${
                      option.currency?.symbol ?? ""
                    }`
                  }
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
            <MaterialReactTable table={table} />
          </CardContent>
        </Card>{" "}
      </Grid>
    </Grid>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<VoucherSchema>();
const columns = [
  columnGroupedDataHelper.accessor("id", { header: "ID" }),
  columnGroupedDataHelper.accessor("title", { header: "Title" }),
  columnGroupedDataHelper.accessor("currency.symbol", {
    header: "Currency",
  }),
  columnGroupedDataHelper.accessor((row) => row.to_date.toLocaleDateString(), {
    header: "Date",
    id: "date",
  }),
];
