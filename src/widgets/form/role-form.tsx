"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums, Prisma } from "@prisma/client";

import { useRouter } from "next/navigation";

import { useCallback, useMemo, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  TextField,
  darken,
  lighten,
  styled,
} from "@mui/material";
import NexCiteButton from "@rms/components/button/nexcite-button";
import { useToast } from "@rms/hooks/toast-hook";
import { createRole, updateRole } from "@rms/service/role-service";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

type Props = { value?: Prisma.RoleGetPayload<{}> };
export default function RoleForm(props: Props) {
  const [isPadding, setTransition] = useTransition();
  const { back } = useRouter();
  const formSchema = useMemo(() => {
    return z.object({
      name: z.string(),

      permissions: z
        .array(z.enum(Object.keys($Enums.UserPermission) as any))
        .min(1)
        .default([]),
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: props.value,
  });
  const toast = useToast();

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setTransition(async () => {
        if (props.value) {
          setTransition(async () => {
            const result = await updateRole(props.value.id, values);
            toast.OpenAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        } else {
          setTransition(async () => {
            const result = await createRole(values as any);
            toast.OpenAlert(result);
            if (result.status === 200) back();
            Object.keys(result.errors ?? []).map((e) => {
              form.setError(e as any, result[e]);
            });
          });
        }
      });
    },
    [back, props.value, form, toast]
  );
  return (
    <>
      <form
        className="max-w-[450px] m-auto"
        onSubmit={form.handleSubmit(handleSubmit)}
        noValidate
      >
        <Card variant="outlined">
          <CardHeader title="Role Form" />
          <CardContent className="flex flex-col gap-5">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <TextField
                    size="small"
                    label="Name"
                    placeholder="name"
                    required
                    fullWidth
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    {...field}
                    InputLabelProps={{ shrink: true }}
                  />
                );
              }}
            />
            <Controller
              name={"permissions"}
              control={form.control}
              render={({ field, fieldState }) => (
                <Autocomplete
                  disablePortal
                  onChange={(e, v) => {
                    field.onChange(v);
                  }}
                  limitTags={8}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={<MdCheckBoxOutlineBlank />}
                        checkedIcon={<MdCheckBox />}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option}
                    </li>
                  )}
                  multiple
                  defaultValue={field.value}
                  size="small"
                  options={Object.keys($Enums.UserPermission).sort((a, b) =>
                    a.localeCompare(b)
                  )}
                  disableCloseOnSelect
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message}
                      InputLabelProps={{ shrink: true }}
                      label="Permissions"
                      placeholder="permissions"
                    />
                  )}
                />
              )}
            />
          </CardContent>
          <div className="flex justify-end5 m-5 mt-2">
            <NexCiteButton isPadding={isPadding} />
          </div>
        </Card>
      </form>
    </>
  );
}
const GroupHeader = styled("div")(({ theme }) => ({
  position: "sticky",
  top: "-8px",
  padding: "4px 10px",
  color: theme.palette.primary.main,
  backgroundColor:
    theme.palette.mode === "light"
      ? lighten(theme.palette.primary.light, 0.85)
      : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled("ul")({
  padding: 0,
});
