"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Prisma } from "@prisma/client";
import useAlertHook from "@rms/hooks/alert-hooks";
import { createCategory, updateCategory } from "@rms/service/category-service";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rms/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@rms/components/ui/card";
import { Input } from "@rms/components/ui/input";
import LoadingButton from "@rms/components/ui/loading-button";
import styled from "styled-components";
import {
  createSubCategory,
  updateSubCategory,
} from "@rms/service/sub-category-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rms/components/ui/select";
import SearchSelect from "@rms/components/ui/search-select";

type Props = {
  node: "category" | "sub_category";
  relations?: Prisma.CategoryGetPayload<{}>[];
  value?: Prisma.CategoryGetPayload<{}> | Prisma.SubCategoryGetPayload<{}>;
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
  const { createAlert } = useAlertHook();

  const handleSubmit = useCallback((values: z.infer<any>) => {
    if (values.category_id) {
      values.category_id = parseInt(values.category_id);
    }

    if (props.value) {
      setTransition(async () => {
        var value2 = JSON.parse(JSON.stringify(values));
        switch (props.node) {
          case "category": {
            await updateCategory(props.value.id, value2).then((res) => {
              createAlert(res);
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
              createAlert(res);
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
              createAlert(res);
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
              createAlert(res);
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
  }, []);
  const ref = useRef<HTMLFormElement>();
  return (
    <>
      <Style className="card" onSubmit={form.handleSubmit(handleSubmit)}>
        <Form {...form}>
          <form className="card" autoComplete="off">
            <Card>
              <CardHeader>
                {" "}
                <div className="flex justify-between items-center">
                  <h1 className="font-medium text-2xl">
                    {props.node === "category" ? "Category" : "SubCategory"}{" "}
                    Form
                  </h1>
                </div>
                <hr className="my-12 h-0.5 border-t-0 bg-gray-100 opacity-100 dark:opacity-50 mt-5" />
              </CardHeader>

              <CardContent>
                <div className="grid gap-4">
                  <div className="grid-cols-12">
                    <FormField
                      rules={{ required: true }}
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="name"
                              onChange={(e) => {}}
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {props.node === "sub_category" && (
                    <div className="grid-cols-12">
                      <FormField
                        rules={{ required: true }}
                        control={form.control}
                        name={"category_id" as any}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Categories</FormLabel>
                            <FormControl>
                              <SearchSelect
                                data={props.relations}
                                hit="select categories"
                                label="categories"
                                onChange={(e) => field.onChange(e)}
                                default={field.value}
                              />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <LoadingButton
                  type="submit"
                  label={props.value ? "Update" : "Add"}
                  loading={isPadding}
                />
              </CardFooter>
            </Card>
          </form>
        </Form>
      </Style>
    </>
  );
}
const Style = styled.div`
  margin: auto;
  margin-top: 5px;
  max-width: 720px;
`;
