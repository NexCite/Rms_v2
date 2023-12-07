"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import { createCategory, updateCategory } from "@rms/service/category-service";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  createSubCategory,
  updateSubCategory,
} from "@rms/service/sub-category-service";

import {
  Autocomplete,
  Card,
  CardContent,
  Divider,
  TextField,
} from "@mui/material";
import NexCiteButton from "@rms/components/button/nexcite-button";
import { useToast } from "@rms/hooks/toast-hook";

type Props =
  | {
      node: "category";
      value?: Prisma.CategoryGetPayload<{}> | Prisma.SubCategoryGetPayload<{}>;
    }
  | {
      node: "sub_category";
      relations?: Prisma.CategoryGetPayload<{}>[];
      value?: Prisma.SubCategoryGetPayload<{}>;
    };

export default function CategoryForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const validation = useMemo(() => {
    const zodObj = {
      name: z
        .string()
        .min(3, { message: "First Name must be at least 3 characters" }),
    };

    if (props.node === "sub_category") {
      zodObj["category_id"] = z.number();
    }

    return z.object(zodObj);
  }, [props.node]);

  const form = useForm<z.infer<typeof validation>>({
    resolver: zodResolver(validation),
    defaultValues: props.value,
  });
  const toast = useToast();
  const handleSubmit = useCallback(
    (values: z.infer<any>) => {
      if (props.value) {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));
          switch (props.node) {
            case "category": {
              await updateCategory(props.value.id, value2).then((res) => {
                toast.OpenAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });
                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
            case "sub_category": {
              await updateSubCategory(props.value.id, value2).then((res) => {
                toast.OpenAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });
                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
          }
        });
      } else {
        setTransition(async () => {
          var value2 = JSON.parse(JSON.stringify(values));
          switch (props.node) {
            case "category": {
              await createCategory(value2).then((res) => {
                toast.OpenAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });
                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
            case "sub_category": {
              await createSubCategory(value2).then((res) => {
                toast.OpenAlert(res);
                Object.keys(res.errors ?? []).map((e) => {
                  form.setError(e as any, res[e]);
                });
                if (res.status === 200) {
                  back();
                }
              });
              break;
            }
          }
        });
      }
    },
    [back, toast, props.node, props.value, form]
  );
  return (
    <form
      className="card"
      autoComplete="off"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
    >
      <Card className="max-w-lg m-auto">
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-medium text-2xl">
              {props.node === "category" ? "Category" : "SubCategory"} Form
            </h1>
          </div>

          <Divider />
        </CardContent>

        <CardContent className="flex gap-5 flex-col">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => {
              return (
                <TextField
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label="Name"
                  size="small"
                  fullWidth
                  placeholder="name"
                  {...field}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              );
            }}
          />

          {props.node === "sub_category" && (
            <Controller
              name={"category_id" as any}
              control={form.control}
              render={({ field, fieldState }) => (
                <Autocomplete
                  disablePortal
                  onChange={(e, v) => {
                    field.onChange(v?.value);
                  }}
                  isOptionEqualToValue={(e) => e.value === props.value?.id}
                  defaultValue={(() => {
                    const result = props.relations.find(
                      (res) => res.id === field.value
                    );

                    return result
                      ? {
                          label: result.name,
                          value: result.id,
                        }
                      : undefined;
                  })()}
                  size="small"
                  options={props.relations.map((res) => ({
                    label: `(${res.id}) ${res.name}`,
                    value: res.id,
                  }))}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                      label="Category"
                      placeholder="category"
                    />
                  )}
                />
              )}
            />
          )}

          <NexCiteButton isPadding={isPadding} />
        </CardContent>
      </Card>
    </form>
  );
}
