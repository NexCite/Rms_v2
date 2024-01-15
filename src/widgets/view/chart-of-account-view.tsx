"use client";

import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Dropdown,
  FormControl,
  FormLabel,
  IconButton,
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
import NexCiteButton from "@rms/components/button/nexcite-button";
import Loading from "@rms/components/other/loading";
import {
  FormatNumberWithFixed,
  VoucherSchema,
  exportToExcell,
} from "@rms/lib/global";
import { findChartOfAccountByClientId } from "@rms/service/chart-of-account-service";
import {
  MaterialReactTable,
  createMRTColumnHelper,
  useMaterialReactTable,
} from "material-react-table";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { AiFillFileExcel } from "react-icons/ai";
import { ChartOfAccountSchema } from "../schema/journal-voucher";
import BalanceSheetTable from "../table/balance-sheet-table";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SearchIcon from "@mui/icons-material/Search";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import Authorized from "@rms/components/other/authorized";
import Link from "next/link";
type Props = {
  id: string;
  chartOfAccounts: Prisma.ChartOfAccountGetPayload<{}>[];
};

export default function ChartOfAccountView(props: Props) {
  const [chartOfAccount, setChartOfAccount] = useState<ChartOfAccountSchema>();
  const [vouchers, setVouchers] = useState<VoucherSchema[]>();

  const [isPadding, setTransation] = useTransition();
  const columns = useMemo(
    () => [
      columnGroupedDataHelper.accessor("id", { header: "ID" }),
      columnGroupedDataHelper.accessor("title", { header: "Title" }),
      columnGroupedDataHelper.accessor("currency.symbol", {
        header: "Currency",
      }),
      columnGroupedDataHelper.accessor(
        (row) => {
          let debit = 0;
          row.voucher_items.forEach((res) => {
            if (res.debit_credit == "Debit") {
              debit += res.amount / res.currency.rate;
            }
          });
          return debit;
        },
        {
          header: "Amount/Rate",
          Cell: ({ cell }) =>
            `${
              cell.row.original.currency?.symbol ?? "$"
            }${FormatNumberWithFixed(cell.getValue(), 2)}`,
        }
      ),
      columnGroupedDataHelper.accessor(
        (row) => {
          return 0;
        },
        {
          header: "Amount",
          Cell: ({ cell, row }) => {
            return (
              <>
                {chartOfAccount?.currency?.symbol ?? "$"}
                {FormatNumberWithFixed(
                  row.getAllCells()[3].getValue<number>() *
                    (chartOfAccount?.currency?.rate ?? 1),
                  2
                )}
              </>
            );
          },
        }
      ),
    ],
    [chartOfAccount?.currency]
  );

  const table = useMaterialReactTable({
    columns,
    muiTableProps: {
      id: "chart-of-account-table-account",
    },

    data: vouchers ?? [],
  });
  const [chartOfAccounts, setChartOfAccounts] = useState<
    typeof props.chartOfAccounts
  >([]);
  const handleData = useCallback(
    (chartOfAccounts: any) => {
      findChartOfAccountByClientId({
        id: props.id,
        include_reffrence: true,
        chartOfAccounts: chartOfAccounts?.map((res) => res.id),
      }).then((result) => {
        setChartOfAccount(result?.result.chartOfAccount);
        setVouchers(result?.result.vouchers);
      });
    },
    [props.id]
  );

  useEffect(() => {
    setTransation(() => {
      handleData(props.chartOfAccounts);
    });
  }, [handleData, props.chartOfAccounts]);
  const { credit, debit } = useMemo(() => {
    let debit: number = 0,
      credit: number = 0;
    vouchers?.forEach((res) => {
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
  }, [props.id, vouchers]);

  const [activeTab, setActiveTab] = useState(0);
  return !chartOfAccount ? (
    <Loading />
  ) : (
    <div className="flex gap-5 flex-col">
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
                    <td>{chartOfAccount.id}</td>
                    <td>{chartOfAccount.name}</td>
                    <td>{chartOfAccount.chart_of_account_type}</td>
                    <td>{chartOfAccount.debit_credit}</td>
                    <td>{chartOfAccount.currency?.name}</td>
                    <td>{chartOfAccount.id}</td>
                    <td>{chartOfAccount.name}</td>
                    <td>{chartOfAccount.chart_of_account_type}</td>
                    <td>{chartOfAccount.debit_credit}</td>
                    <td>{chartOfAccount.currency?.name}</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* <Typography level="h4">
              First Name: {chartOfAccount.first_name}
            </Typography> */}
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
            className={`${
              activeTab == 0 ? "p-5 flex flex-col gap-5" : "hidden"
            }`}
          >
            <div className="grid grid-cols-1   lg:grid-cols-3 gap-5">
              <Card variant="outlined" invertedColors>
                <CardContent orientation="horizontal">
                  <CardContent>
                    <Typography level="body-md">Total Debit</Typography>
                    <Typography level="h2">
                      {chartOfAccount?.currency?.symbol ?? "$"}
                      {FormatNumberWithFixed(
                        debit * (chartOfAccount?.currency?.rate ?? 1),
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
                      {chartOfAccount?.currency?.symbol ?? "$"}
                      {FormatNumberWithFixed(
                        credit * (chartOfAccount?.currency?.rate ?? 1),
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
                    <Typography
                      level="h2"
                      color={debit - credit > 0 ? "success" : "danger"}
                    >
                      {chartOfAccount?.currency?.symbol ?? "$"}
                      {FormatNumberWithFixed(
                        (debit - credit) *
                          (chartOfAccount?.currency?.rate ?? 1),
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
                  isOptionEqualToValue={(e) =>
                    e.id === chartOfAccounts.find((res) => res.id === e.id)?.id
                  }
                  className="w-full"
                  name="chart_of_accounts"
                  disableCloseOnSelect
                  options={props.chartOfAccounts}
                  value={chartOfAccounts}
                  getOptionLabel={(option: any) =>
                    `${option.id} ${option.name}`
                  }
                  onChange={(e, newValue) => {
                    setChartOfAccounts(newValue as any);
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
                    exportToExcell({
                      sheet: "chart of account",
                      id: "chart-of-account-table-account",
                    });
                  }}
                >
                  Export Excel
                </Button>
                <NexCiteButton
                  onClick={(e) => {
                    setTransation(async () => {
                      handleData(chartOfAccounts);
                    });
                  }}
                  icon={<SearchIcon />}
                  type="button"
                  isPadding={isPadding}
                >
                  Search
                </NexCiteButton>
              </div>
            </div>
            <div className="flex-col md:flex-row flex justify-between items-center gap-5"></div>
            <MaterialReactTable table={table} />
          </div>
          <div className={`${activeTab == 1 ? "" : "hidden"} p-5`}>
            <BalanceSheetTable
              currency={chartOfAccount?.currency}
              accountId={props.id}
            />
          </div>
        </Tabs>
      </>
    </div>
  );
}
const columnGroupedDataHelper = createMRTColumnHelper<VoucherSchema>();
