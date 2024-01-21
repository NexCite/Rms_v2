"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  CardContent,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Table,
  Textarea,
} from "@mui/joy";
import { Prisma } from "@prisma/client";
import NexCiteButton from "@rms/components/button/nexcite-button";
import NexCiteCard from "@rms/components/card/nexcite-card";
import NumericFormatCustom from "@rms/components/input/text-field-number";
import { useToast } from "@rms/hooks/toast-hook";
import { EquitySchema } from "@rms/schema/equity";
import { createEquity, updateEquity } from "@rms/service/equity-service";
import dayjs from "dayjs";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

interface Props {
  id?: number;
  isEditMode?: boolean;
  value: Prisma.EquityGetPayload<{
    select: {
      agent_boxes: true;
      manager_boxes: true;
      p_l: true;
      coverage_boxes: true;
      expensive_box: true;
      to_date: true;
      description: true;
      adjustment_boxes: true;
      credit_boxes: true;
    };
  }>;
  Equities: Prisma.EquityGetPayload<{}>[];
}

export default function EquityForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { replace } = useRouter();
  const pathName = usePathname();

  const toast = useToast();
  const form = useForm<EquitySchema>({
    resolver: zodResolver(EquitySchema),
    defaultValues: {
      description: props.value?.description || "",
      to_date: props.value?.to_date || new Date(),
      managers: props.value?.manager_boxes || [],
      agents: props.value?.agent_boxes || [],
      coverage: props.value?.coverage_boxes || [],
      expensive: props.value?.expensive_box || [],
      credit: props.value?.credit_boxes || [],
      adjustment: props.value?.adjustment_boxes || [],

      p_l: props.value?.p_l || [],
    } as any,
  });

  const handleSubmit = useCallback(
    (values: EquitySchema) => {
      var formsData = {
        description: values.description,
        to_date: values.to_date,
        manager_boxes: values.managers,
        expensive_box: values.expensive,
        p_l: values.p_l,
        agent_boxes: values.agents,
        coverage_boxes: values.coverage,
        adjustment_boxes: values.adjustment,
        credit_boxes: values.credit,
      };

      setTransition(async () => {
        if (props.isEditMode) {
          const result = await updateEquity(props.id, formsData as any);
          toast.OpenAlert(result);
        } else {
          const result = await createEquity(formsData as any);
          toast.OpenAlert(result);
          if (result.status === 200) {
            replace(pathName + "?id=" + result.result.id);
          }
        }
      });
      // }
    },
    [props.isEditMode, props.id, toast, replace, pathName]
  );

  const watch = useWatch({ control: form.control });
  console.log(watch.coverage);
  const handleDelete = useCallback(
    (
      index: number,
      name:
        | "coverage"
        | "managers"
        | "expensive"
        | "p_l"
        | "agents"
        | "adjustment"
        | "credit"
    ) => {
      form.getValues()[name].splice(index, 1);
      form.setValue(name, form.getValues()[name]);
    },
    [form]
  );

  const handleAdd = useCallback(
    (
      name:
        | "coverage"
        | "managers"
        | "expensive"
        | "p_l"
        | "agents"
        | "adjustment"
        | "credit"
    ) => {
      switch (name) {
        case "coverage":
          form.setValue(
            name,
            form.getValues().coverage.concat([
              {
                starting_float: 0,
                current_float: 0,
                closed_p_l: 0,
                account: "",
              },
            ])
          );
          break;
        case "managers":
          form.setValue(
            name,
            form.getValues().managers.concat([
              {
                starting_float: 0,
                current_float: 0,
                commission: 0,
                p_l: 0,
                swap: 0,
                manger: "",
              },
            ])
          );
          break;
        case "expensive":
          form.setValue(
            name,
            form.getValues().expensive.concat([
              {
                name: "",
                expensive: 0,
              },
            ])
          );
          break;
        case "p_l":
          form.setValue(
            name,
            form.getValues().p_l.concat([
              {
                name: "",
                p_l: 0,
              },
            ])
          );
          break;
        case "agents":
          form.setValue(
            name,
            form.getValues().agents.concat([
              {
                name: "",
                commission: 0,
              },
            ])
          );
          break;
        case "adjustment":
          form.setValue(
            name,
            form.getValues().adjustment.concat([
              {
                name: "",
                adjustment: 0,
              },
            ])
          );
          break;
        case "credit":
          form.setValue(
            name,
            form.getValues().credit.concat([
              {
                name: "",
                credit: 0,
              },
            ])
          );
          break;
        default:
          break;
      }
    },
    [form]
  );

  return (
    <form noValidate onSubmit={form.handleSubmit(handleSubmit)}>
      <NexCiteCard title="Equity Form">
        <CardContent className="flex gap-2 flex-col">
          <div className="flex gap-3 flex-col">
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormControl error={Boolean(fieldState.error)}>
                  <FormLabel required>Description</FormLabel>
                  <Textarea
                    value={field.value}
                    onChange={field.onChange}
                    minRows={3}
                    placeholder="Description"
                  />
                </FormControl>
              )}
            />
            <Controller
              name="to_date"
              control={form.control}
              render={({ field, fieldState, formState }) => (
                <FormControl error={Boolean(fieldState.error)} required>
                  <FormLabel>Date</FormLabel>
                  <Input
                    fullWidth
                    type="date"
                    size="lg"
                    value={dayjs(field.value).format("YYYY-MM-DD")}
                    onChange={(e) => {
                      field.onChange(e.target.valueAsDate);
                    }}
                    placeholder={field.name.replaceAll("_", " ")}
                  />
                </FormControl>
              )}
            />
          </div>
          {/* ************Coverage Boxes Start************ */}
          <div>
            <div
              style={{ margin: "0px 0px 0px" }}
              className="mt-4 flex justify-between"
            >
              <h1 className="text-2xl">Coverage Account</h1>
              <IconButton onClick={() => handleAdd("coverage")}>
                <AddIcon />
              </IconButton>
            </div>
            <Divider className="mb-5" />
            <Table variant="outlined">
              <thead>
                <tr>
                  <th></th>
                  <th>Account</th>
                  <th>Starting Float</th>
                  <th>Current Float</th>
                  <th>Closed PL</th>
                </tr>
              </thead>
              <tbody>
                {watch.coverage?.map((res, i) => (
                  <tr key={i}>
                    <td>
                      <IconButton onClick={() => handleDelete(i, "coverage")}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                    <td>
                      <Controller
                        control={form.control}
                        name={`coverage.${i}.account` as any}
                        render={({ fieldState, field }) => (
                          <FormControl error={Boolean(fieldState.error)}>
                            <Input
                              value={res.account}
                              onChange={({ target: { value } }) => {
                                console.log(value);
                                field.onChange(value);
                              }}
                              placeholder={"account"}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    {["starting_float", "current_float", "closed_p_l"].map(
                      (item, index) => (
                        <td key={index}>
                          <Controller
                            control={form.control}
                            name={`coverage.${i}.${item}` as any}
                            render={({ fieldState, field }) => (
                              <FormControl error={Boolean(fieldState.error)}>
                                <Input
                                  value={res[item]}
                                  onChange={({ target: { value } }) => {
                                    if (Number.isNaN(value)) {
                                      field.onChange(0);
                                    } else {
                                      field.onChange(parseFloat(value));
                                    }
                                  }}
                                  placeholder={item.replaceAll("_", " ")}
                                  slotProps={{
                                    input: {
                                      component: NumericFormatCustom,
                                    },
                                  }}
                                />
                              </FormControl>
                            )}
                          />
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* ************Coverage Boxes End************ */}
          {/* ************Manager Boxes start************ */}
          <div>
            <div
              style={{ margin: "0px 0px 0px" }}
              className="mt-4 flex justify-between"
            >
              <h1 className="text-2xl">Manager</h1>
              <IconButton onClick={() => handleAdd("managers")}>
                <AddIcon />
              </IconButton>
            </div>
            <Divider className="mb-5" />
            <Table variant="outlined">
              <thead>
                <tr>
                  <th></th>
                  <th>Manger</th>
                  <th>Starting Float</th>
                  <th>Current Float</th>
                  <th>PL</th>
                  <th>Commission</th>
                  <th>Swap</th>
                </tr>
              </thead>
              <tbody>
                {watch.managers?.map((res, i) => (
                  <tr key={i}>
                    <td>
                      <IconButton onClick={() => handleDelete(i, "managers")}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                    <td>
                      <Controller
                        control={form.control}
                        name={`managers.${i}.manger` as any}
                        render={({ fieldState, field }) => (
                          <FormControl error={Boolean(fieldState.error)}>
                            <Input
                              value={res.manger}
                              onChange={({ target: { value } }) => {
                                field.onChange(value);
                              }}
                              placeholder={"manger"}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    {[
                      "starting_float",
                      "current_float",
                      "p_l",
                      "commission",
                      "swap",
                    ].map((item, index) => (
                      <td key={index}>
                        <Controller
                          control={form.control}
                          name={`managers.${i}.${item}` as any}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                value={res[item]}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder={item.replaceAll("_", " ")}
                                slotProps={{
                                  input: {
                                    component: NumericFormatCustom,
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* ************Manager Boxes End************ */}
          {/* ************Expensive Boxes start************ */}
          <div>
            <div
              style={{ margin: "0px 0px 0px" }}
              className="mt-4 flex justify-between"
            >
              <h1 className="text-2xl">Expensive</h1>
              <IconButton onClick={() => handleAdd("expensive")}>
                <AddIcon />
              </IconButton>
            </div>
            <Divider className="mb-5" />
            <Table variant="outlined">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Expensive</th>
                </tr>
              </thead>
              <tbody>
                {watch.expensive?.map((res, i) => (
                  <tr key={i}>
                    <td>
                      <IconButton onClick={() => handleDelete(i, "expensive")}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                    <td>
                      <Controller
                        control={form.control}
                        name={`expensive.${i}.name` as any}
                        render={({ fieldState, field }) => (
                          <FormControl error={Boolean(fieldState.error)}>
                            <Input
                              value={res.name}
                              onChange={({ target: { value } }) => {
                                field.onChange(value);
                              }}
                              placeholder={"name"}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    {["expensive"].map((item, index) => (
                      <td key={index}>
                        <Controller
                          control={form.control}
                          name={`expensive.${i}.${item}` as any}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                value={res[item]}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder={item.replaceAll("_", " ")}
                                slotProps={{
                                  input: {
                                    component: NumericFormatCustom,
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* ************Expensive Boxes End************ */}
          {/* ************P_L Boxes start************ */}
          <div>
            <div
              style={{ margin: "0px 0px 0px" }}
              className="mt-4 flex justify-between"
            >
              <h1 className="text-2xl">PL</h1>
              <IconButton onClick={() => handleAdd("p_l")}>
                <AddIcon />
              </IconButton>
            </div>
            <Divider className="mb-5" />
            <Table variant="outlined">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>p_l</th>
                </tr>
              </thead>
              <tbody>
                {watch.p_l?.map((res, i) => (
                  <tr key={i}>
                    <td>
                      <IconButton onClick={() => handleDelete(i, "p_l")}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                    <td>
                      <Controller
                        control={form.control}
                        name={`p_l.${i}.name` as any}
                        render={({ fieldState, field }) => (
                          <FormControl error={Boolean(fieldState.error)}>
                            <Input
                              value={res.name}
                              onChange={({ target: { value } }) => {
                                field.onChange(value);
                              }}
                              placeholder={"name"}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    {["p_l"].map((item, index) => (
                      <td key={index}>
                        <Controller
                          control={form.control}
                          name={`p_l.${i}.${item}` as any}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                value={res[item]}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder={item.replaceAll("_", " ")}
                                slotProps={{
                                  input: {
                                    component: NumericFormatCustom,
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* ************P_L Boxes End************ */}
          {/* ************Agent Boxes start************ */}
          <div>
            <div
              style={{ margin: "0px 0px 0px" }}
              className="mt-4 flex justify-between"
            >
              <h1 className="text-2xl">Agent</h1>
              <IconButton onClick={() => handleAdd("agents")}>
                <AddIcon />
              </IconButton>
            </div>
            <Divider className="mb-5" />
            <Table variant="outlined">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {watch.agents?.map((res, i) => (
                  <tr key={i}>
                    <td>
                      <IconButton onClick={() => handleDelete(i, "agents")}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                    <td>
                      <Controller
                        control={form.control}
                        name={`agents.${i}.name` as any}
                        render={({ fieldState, field }) => (
                          <FormControl error={Boolean(fieldState.error)}>
                            <Input
                              value={res.name}
                              onChange={({ target: { value } }) => {
                                field.onChange(value);
                              }}
                              placeholder={"name"}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    {["commission"].map((item, index) => (
                      <td key={index}>
                        <Controller
                          control={form.control}
                          name={`agents.${i}.${item}` as any}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                value={res[item]}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder={item.replaceAll("_", " ")}
                                slotProps={{
                                  input: {
                                    component: NumericFormatCustom,
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* ************Agent Boxes End************ */}
          {/* ************Adjustment Boxes start************ */}
          <div>
            <div
              style={{ margin: "0px 0px 0px" }}
              className="mt-4 flex justify-between"
            >
              <h1 className="text-2xl">Adjustment</h1>
              <IconButton onClick={() => handleAdd("adjustment")}>
                <AddIcon />
              </IconButton>
            </div>
            <Divider className="mb-5" />
            <Table variant="outlined">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {watch.adjustment?.map((res, i) => (
                  <tr key={i}>
                    <td>
                      <IconButton onClick={() => handleDelete(i, "adjustment")}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                    <td>
                      <Controller
                        control={form.control}
                        name={`adjustment.${i}.name` as any}
                        render={({ fieldState, field }) => (
                          <FormControl error={Boolean(fieldState.error)}>
                            <Input
                              value={res.name}
                              onChange={({ target: { value } }) => {
                                field.onChange(value);
                              }}
                              placeholder={"name"}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    {["adjustment"].map((item, index) => (
                      <td key={index}>
                        <Controller
                          control={form.control}
                          name={`adjustment.${i}.${item}` as any}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                value={res[item]}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder={item.replaceAll("_", " ")}
                                slotProps={{
                                  input: {
                                    component: NumericFormatCustom,
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* ************Adjustment Boxes End************ */}
          {/* ************Credit Boxes start************ */}
          <div>
            <div
              style={{ margin: "0px 0px 0px" }}
              className="mt-4 flex justify-between"
            >
              <h1 className="text-2xl">credit</h1>
              <IconButton onClick={() => handleAdd("credit")}>
                <AddIcon />
              </IconButton>
            </div>
            <Divider className="mb-5" />
            <Table variant="outlined">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {watch.credit?.map((res, i) => (
                  <tr key={i}>
                    <td>
                      <IconButton onClick={() => handleDelete(i, "credit")}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </td>
                    <td>
                      <Controller
                        control={form.control}
                        name={`credit.${i}.name` as any}
                        render={({ fieldState, field }) => (
                          <FormControl error={Boolean(fieldState.error)}>
                            <Input
                              value={res.name}
                              onChange={({ target: { value } }) => {
                                field.onChange(value);
                              }}
                              placeholder={"name"}
                            />
                          </FormControl>
                        )}
                      />
                    </td>
                    {["credit"].map((item, index) => (
                      <td key={index}>
                        <Controller
                          control={form.control}
                          name={`credit.${i}.${item}` as any}
                          render={({ fieldState, field }) => (
                            <FormControl error={Boolean(fieldState.error)}>
                              <Input
                                value={res[item]}
                                onChange={({ target: { value } }) => {
                                  if (Number.isNaN(value)) {
                                    field.onChange(0);
                                  } else {
                                    field.onChange(parseFloat(value));
                                  }
                                }}
                                placeholder={item.replaceAll("_", " ")}
                                slotProps={{
                                  input: {
                                    component: NumericFormatCustom,
                                  },
                                }}
                              />
                            </FormControl>
                          )}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {/* ************Credit Boxes End************ */}
          <div className="flex flex-row-reverse">
            <NexCiteButton isPadding={isPadding} type="submit">
              Save
            </NexCiteButton>
          </div>{" "}
        </CardContent>
      </NexCiteCard>
    </form>
  );
}

function checkBoxesError(props: any, index: number, name: string) {
  if (Boolean(props.error)) {
    if (Boolean(props.error))
      switch (Boolean(props.error.message)) {
        case true:
          if (Boolean(props.error[index]))
            return props.error[index][name]?.message ?? "";

        default:
          if (Boolean(props.error[index]))
            return props.error[index][name]?.message ?? "";
      }
  }

  return "";
}
