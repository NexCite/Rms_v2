"use client";

import styled from "@emotion/styled";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Prisma } from "@prisma/client";
import NexCiteButton from "@rms/components/button/nexcite-button";
import Authorized from "@rms/components/ui/authorized";
import { useToast } from "@rms/hooks/toast-hook";
import { FormatNumberWithFixed } from "@rms/lib/global";
import { deleteEquityById } from "@rms/service/equity-service";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";

type Props = {
  equity: Prisma.EquityGetPayload<{
    include: {
      agent_boxes: true;
      coverage_boxes: true;
      expensive_box: true;
      manager_boxes: true;
      adjustment_boxes: true;
      credit_boxes: true;
      p_l: true;
    };
  }>;
};

export default function EquityView(props: Props) {
  const {
    coverage_boxes,
    manager_boxes,
    commission_boxes,
    p_l_boxes,
    expensive_boxes,
    total,
    credit_boxes,
    adjustment_boxes,
  } = useMemo(() => {
    var coverage_boxes = 0,
      manager_boxes = 0,
      commission_boxes = 0,
      p_l_boxes = 0,
      expensive_boxes = 0,
      adjustment_boxes = 0,
      credit_boxes = 0,
      total = 0;

    var starting_float_coverage = 0,
      current_float_coverage = 0,
      closed_p_l_coverage = 0;
    props.equity?.coverage_boxes.map((res) => {
      current_float_coverage += res.current_float;
      closed_p_l_coverage += res.closed_p_l;
      starting_float_coverage += res.starting_float;
    });

    coverage_boxes =
      current_float_coverage - starting_float_coverage + closed_p_l_coverage;

    var starting_float_manager = 0,
      current_float_manager = 0,
      commission_manager = 0,
      p_l_manager = 0,
      swap_manager = 0;

    props.equity.manager_boxes.map((res, i) => {
      current_float_manager += res.current_float;
      p_l_manager += res.p_l;
      starting_float_manager += res.starting_float;
      commission_manager += res.commission;
      swap_manager += res.swap;
    });

    manager_boxes =
      current_float_manager -
      starting_float_manager +
      p_l_manager +
      commission_manager +
      swap_manager;
    props.equity.agent_boxes.map((res, i) => {
      commission_boxes += res.commission;
    });

    props.equity.p_l.map((res, i) => {
      p_l_boxes += res.p_l;
    });

    props.equity.expensive_box.map((res, i) => {
      expensive_boxes += res.expensive;
    });
    props.equity.adjustment_boxes.map((res, i) => {
      adjustment_boxes += res.adjustment;
    });
    props.equity.credit_boxes.map((res, i) => {
      credit_boxes += res.credit;
    });
    total =
      coverage_boxes -
      manager_boxes -
      commission_boxes +
      p_l_boxes -
      expensive_boxes -
      adjustment_boxes -
      credit_boxes;
    return {
      coverage_boxes,
      manager_boxes,
      commission_boxes,
      p_l_boxes,
      expensive_boxes,
      total,
      adjustment_boxes,
      credit_boxes,
    };
  }, [props.equity]);
  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
  const { back } = useRouter();

  return (
    <Style>
      <div className="border rounded-md p-3 flex gap-2 flex-col">
        <div className="flex flex-row-reverse gap-5">
          <Authorized permission="Edit_Equity">
            <Link href={`/admin/payment_box/equity/form?id=${props.equity.id}`}>
              <NexCiteButton className="w-[150px]" label="Edit"></NexCiteButton>
            </Link>
          </Authorized>
          <Authorized permission="Delete_Equity">
            <NexCiteButton
              isPadding={isPadding}
              label="Delete"
              className="bg-red-500 w-[150px]"
              onClick={() => {
                const isConfirm = confirm(
                  `Do You sure you want to delete  id:${props.equity.id} `
                );
                if (isConfirm) {
                  setTransition(async () => {
                    const result = await deleteEquityById(props.equity.id);

                    if (result.status === 200) {
                      back();
                    }
                    toast.OpenAlert({
                      ...result,
                      replace: "/admin/payment_box/box",
                    });
                  });
                }
              }}
            >
              Delete
            </NexCiteButton>
          </Authorized>
        </div>
        <div className="flex justify-between w-full mt-5">
          <h1 className="text-3xl">Description</h1>
          <h1 className="text-2xl text-end">
            Date: {props.equity.to_date.toLocaleDateString()}{" "}
          </h1>
        </div>
        <Divider />
        <p className="text-2xl p-1">{props.equity.description}</p>
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4 ">
        <Card variant="outlined">
          <CardHeader title="Coverage" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5">
              ${FormatNumberWithFixed(coverage_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader title="Client" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5">
              ${FormatNumberWithFixed(manager_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader title="Commission" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5">
              ${FormatNumberWithFixed(commission_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader title="P&L" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5">
              ${FormatNumberWithFixed(p_l_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader title="Expensive" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5">
              ${FormatNumberWithFixed(expensive_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader title="Adjustment" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5">
              ${FormatNumberWithFixed(adjustment_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardHeader title="Credit" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5">
              ${FormatNumberWithFixed(credit_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <div
            className={`w-full h-2 ${
              total >= 0 ? "bg-green-500" : "bg-red-400"
            }`}
          ></div>
          <CardHeader title="NetProfit" />
          <CardContent className="mt-0 pt-0">
            <Typography variant="h5" style={{}}>
              ${FormatNumberWithFixed(total)}
            </Typography>
          </CardContent>
        </Card>
      </div>
      {props.equity.coverage_boxes.length > 0 && (
        <div className="border mt-10 p-5 overflow-auto">
          <Typography variant="h4">Coverage</Typography>
          <Divider className="mt-5" />
          <div className="overflow-auto">
            <Table className="overflow-x-auto w-full ">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Accounts</TableCell>
                  <TableCell align="center">Starting Floating</TableCell>
                  <TableCell align="center">Current Floating </TableCell>
                  <TableCell align="center">Closed P/L</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.coverage_boxes.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.account}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.starting_float)}
                    </TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.current_float)}
                    </TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.closed_p_l)}
                    </TableCell>
                    <TableCell align="center">
                      $
                      {FormatNumberWithFixed(
                        res.starting_float - res.current_float + res.closed_p_l
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell colSpan={4}> </TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(coverage_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
      {props.equity.manager_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography variant="h4">Manager</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Managers</TableCell>
                  <TableCell align="center">Starting Floating</TableCell>
                  <TableCell align="center">Current Floating </TableCell>
                  <TableCell align="center"> P/L</TableCell>
                  <TableCell align="center"> Commission</TableCell>
                  <TableCell align="center"> Swap</TableCell>
                  <TableCell align="center">Total</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.manager_boxes.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.manger}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.starting_float)}
                    </TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.current_float)}
                    </TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.p_l)}
                    </TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.commission)}
                    </TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.swap)}
                    </TableCell>
                    <TableCell align="center">
                      $
                      {FormatNumberWithFixed(
                        res.current_float -
                          res.starting_float +
                          res.p_l +
                          res.swap +
                          res.commission
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell colSpan={6}> </TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(manager_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}

      {props.equity.agent_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography variant="h4">Agents</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Agent</TableCell>
                  <TableCell align="center">Comssion</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.agent_boxes.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.name}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.commission)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(commission_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}

      {props.equity.p_l.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography variant="h4">P&L</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Amount</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.p_l.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.name}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.p_l)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(p_l_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
      {props.equity.expensive_box.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography variant="h4">Expensives</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Amount</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.expensive_box.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.name}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.expensive)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(expensive_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
      {props.equity.expensive_box.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography variant="h4">Adjustments</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Adjustment</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.adjustment_boxes.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.name}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.adjustment)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(adjustment_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
      {props.equity.adjustment_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography variant="h4">Adjustment</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Adjustment</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.adjustment_boxes.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.name}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.adjustment)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(adjustment_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
      {props.equity.credit_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography variant="h4">Credit</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Name</TableCell>
                  <TableCell align="center">Credit</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.equity.credit_boxes.map((res, i) => (
                  <TableRow key={i}>
                    <TableCell align="center">{res.name}</TableCell>
                    <TableCell align="center">
                      ${FormatNumberWithFixed(res.credit)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

              <TableFooter>
                <TableRow className="border-t ">
                  <TableCell align="center">Total</TableCell>
                  <TableCell align="center">
                    ${FormatNumberWithFixed(credit_boxes)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      )}
    </Style>
  );
}

const Style = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  th {
    min-width: 200px;
  }
  th {
    font-size: 1.2rem;
  }

  td {
    font-size: 1.1rem;
  }
  tfoot td {
    font-size: 1.2rem;
    color: black;
  }
`;
