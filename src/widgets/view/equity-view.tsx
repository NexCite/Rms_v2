"use client";

import { Card, CardContent, Divider, Table, Typography } from "@mui/joy";

import { Prisma } from "@prisma/client";
import NexCiteButton from "@nexcite/components/button/nexcite-button";
import NexCiteCard from "@nexcite/components/card/nexcite-card";
import Authorized from "@nexcite/components/other/authorized";
import { useToast } from "@nexcite/hooks/toast-hook";
import { FormatNumberWithFixed } from "@nexcite/lib/global";
import { deleteEquityById } from "@nexcite/service/equity-service";
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
    <NexCiteCard
      title={`Equity For ${props.equity.to_date.toLocaleDateString()}`}
      className="text-3xl"
    >
      <div className="flex flex-row-reverse gap-5">
        <Authorized permission="Update_Equity">
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
      </div>
      <Divider />
      <p className="text-2xl p-1">{props.equity.description}</p>

      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4 ">
        <Card>
          <Typography fontSize={20}>Coverage</Typography>
          <CardContent className="mt-0 pt-0">
            <Typography fontSize={23}>
              ${FormatNumberWithFixed(coverage_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-0 pt-0">
            <Typography fontSize={20}>Client</Typography>

            <Typography fontSize={23}>
              ${FormatNumberWithFixed(manager_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-0 pt-0">
            <Typography fontSize={20}>Commission</Typography>

            <Typography fontSize={23}>
              ${FormatNumberWithFixed(commission_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-0 pt-0">
            <Typography fontSize={20}>PL</Typography>

            <Typography fontSize={23}>
              ${FormatNumberWithFixed(p_l_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-0 pt-0">
            <Typography fontSize={20}>Expensive</Typography>

            <Typography fontSize={23}>
              ${FormatNumberWithFixed(expensive_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-0 pt-0">
            <Typography fontSize={20}>Adjustment</Typography>

            <Typography fontSize={23}>
              ${FormatNumberWithFixed(adjustment_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="mt-0 pt-0">
            <Typography fontSize={20}>Credit</Typography>

            <Typography fontSize={23}>
              ${FormatNumberWithFixed(credit_boxes)}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <Typography fontSize={20}>NetProfit</Typography>

          <CardContent className="mt-0 pt-0">
            <Typography fontSize={23} color={total >= 0 ? "success" : "danger"}>
              ${FormatNumberWithFixed(total)}
            </Typography>
          </CardContent>
        </Card>
      </div>
      {props.equity.coverage_boxes.length > 0 && (
        <div className="border mt-10 p-5 overflow-auto">
          <Typography fontSize={20}>Coverage</Typography>
          <Divider className="mt-5" />
          <div className="overflow-auto">
            <Table className="overflow-x-auto w-full ">
              <thead>
                <tr>
                  <th>Accounts</th>
                  <th>Starting Floating</th>
                  <th>Current Floating </th>
                  <th>Closed P/L</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.coverage_boxes.map((res, i) => (
                  <tr key={i}>
                    <td>{res.account}</td>
                    <td>${FormatNumberWithFixed(res.starting_float, 2)}</td>
                    <td>${FormatNumberWithFixed(res.current_float, 2)}</td>
                    <td>${FormatNumberWithFixed(res.closed_p_l, 2)}</td>
                    <td>
                      $
                      {FormatNumberWithFixed(
                        res.starting_float - res.current_float + res.closed_p_l
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td colSpan={4}> </td>
                  <td>${FormatNumberWithFixed(coverage_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}
      {props.equity.manager_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography>Manager</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <thead>
                <tr>
                  <th>Managers</th>
                  <th>Starting Floating</th>
                  <th>Current Floating </th>
                  <th> P/L</th>
                  <th> Commission</th>
                  <th> Swap</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.manager_boxes.map((res, i) => (
                  <tr key={i}>
                    <td>{res.manger}</td>
                    <td>${FormatNumberWithFixed(res.starting_float, 2)}</td>
                    <td>${FormatNumberWithFixed(res.current_float, 2)}</td>
                    <td>${FormatNumberWithFixed(res.p_l, 2)}</td>
                    <td>${FormatNumberWithFixed(res.commission, 2)}</td>
                    <td>${FormatNumberWithFixed(res.swap, 2)}</td>
                    <td>
                      $
                      {FormatNumberWithFixed(
                        res.current_float -
                          res.starting_float +
                          res.p_l +
                          res.swap +
                          res.commission
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td colSpan={6}> </td>
                  <td>${FormatNumberWithFixed(manager_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}

      {props.equity.agent_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography>Agents</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Comssion</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.agent_boxes.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>${FormatNumberWithFixed(res.commission, 2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td>Total</td>
                  <td>${FormatNumberWithFixed(commission_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}

      {props.equity.p_l.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography>P&L</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.p_l.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>${FormatNumberWithFixed(res.p_l, 2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td>Total</td>
                  <td>${FormatNumberWithFixed(p_l_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}
      {props.equity.expensive_box.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography>Expensives</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.expensive_box.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>${FormatNumberWithFixed(res.expensive, 2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td>Total</td>
                  <td>${FormatNumberWithFixed(expensive_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}
      {props.equity.expensive_box.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography>Adjustments</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Adjustment</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.adjustment_boxes.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>${FormatNumberWithFixed(res.adjustment, 2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td>Total</td>
                  <td>${FormatNumberWithFixed(adjustment_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}
      {props.equity.adjustment_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography>Adjustment</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Adjustment</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.adjustment_boxes.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>${FormatNumberWithFixed(res.adjustment, 2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td>Total</td>
                  <td>${FormatNumberWithFixed(adjustment_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}
      {props.equity.credit_boxes.length > 0 && (
        <div className="border mt-10 p-5">
          <Typography>Credit</Typography>
          <Divider className="mt-5" />
          <div className=" overflow-auto">
            <Table className="overflow-x-auto w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Credit</th>
                </tr>
              </thead>

              <tbody>
                {props.equity.credit_boxes.map((res, i) => (
                  <tr key={i}>
                    <td>{res.name}</td>
                    <td>${FormatNumberWithFixed(res.credit, 2)}</td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="border-t ">
                  <td>${FormatNumberWithFixed(credit_boxes, 2)}</td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>
      )}
    </NexCiteCard>
  );
}
