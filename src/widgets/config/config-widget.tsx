"use client";
import { Card, CardContent, CardHeader, TextField } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import LoadingButton from "@mui/lab/LoadingButton";
import { useStore } from "@rms/hooks/toast-hook";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import z from "zod";
import { fileZod } from "@rms/lib/common";
import { initConfig, editConfig } from "@rms/service/config-service";
import { MuiFileInput } from "mui-file-input";
import { MdAttachFile, MdClose, MdDelete } from "react-icons/md";
import Image from "next/image";
import { Prisma } from "@prisma/client";

export function InitConfig() {
  const formSchema = z.object({
    config: z.object({
      name: z.string().min(3),
      first_name: z.string().min(3),
      last_name: z.string().min(3),
      phone_number: z
        .string()
        .regex(
          new RegExp(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
          ),
          {
            message: "Invalid phone number",
          }
        ),
      email: z.string().email(),
      username: z.string().min(4),
      password: z.string().min(4),
    }),

    file: fileZod,
  });

  const [isPadding, setTransition] = useTransition();
  const store = useStore();
  const { replace } = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const watch = useWatch({ control: form.control });
  const defaultImage = useMemo(() => {
    const file = watch.file;
    if (file) {
      return URL.createObjectURL(file);
    }
  }, [watch.file]);
  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      var dataForm = new FormData();

      if (values.file) {
        dataForm.append("file", values.file);
      } else {
        dataForm = undefined;
      }
      setTransition(async () => {
        const res = await initConfig({
          config: values.config as any,
          file: dataForm,
        });
        store.OpenAlert({ ...res });

        if (res.status === 200) replace("/login");
        Object.keys(res.errors ?? []).map((e) => {
          form.setError(e as any, res[e]);
        });
      });
    },
    [, replace, form, store]
  );
  return (
    <div className="flex justify-center items-center">
      <Card className="w-[350px] overflow-y-auto mt-3  max-h-[100vh] ">
        <CardHeader
          title={
            <div>
              <h1>Setup New Project</h1>
              <h5>create project</h5>
            </div>
          }
        ></CardHeader>
        <CardContent>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            <Controller
              control={form.control}
              name="config.name"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"App Name"}
                  placeholder="app name"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="config.first_name"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"First Name"}
                  placeholder="first name"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="config.last_name"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Last Name"}
                  placeholder="last name"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="config.username"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Username"}
                  placeholder="username"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="config.password"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Password"}
                  autoComplete={"new-password"}
                  placeholder="password"
                  type="password"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="config.email"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Email"}
                  placeholder="email"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="config.phone_number"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Phone Number"}
                  placeholder="phone number"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="file"
              render={({ field, fieldState }) => (
                <>
                  {!defaultImage && (
                    <MuiFileInput
                      value={field.value}
                      label={"Append File"}
                      {...field}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState?.error?.message}
                      clearIconButtonProps={{
                        children: <MdClose fontSize="small" />,
                      }}
                      InputProps={{
                        inputProps: {
                          accept: "image/*",
                        },
                        startAdornment: <MdAttachFile />,
                      }}
                    />
                  )}

                  <div className="mt-3">
                    {defaultImage && typeof defaultImage === "string" ? (
                      <div>
                        <LoadingButton
                          color="error"
                          loading={isPadding}
                          onClick={() => {
                            setTransition(async () => {
                              field.onChange();
                            });
                          }}
                          startIcon={<MdDelete />}
                        ></LoadingButton>
                        <Image
                          width={60}
                          height={60}
                          alt="logo"
                          src={defaultImage}
                          className="rounded-md object-contain   border w-full h-full "
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              )}
            />
            <div className="flex justify-end">
              <LoadingButton
                variant="contained"
                fullWidth
                className={
                  isPadding
                    ? ""
                    : "hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white "
                }
                disableElevation
                type="submit"
                loading={isPadding}
              >
                Save
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type Props = {
  id: number;
  config: Prisma.ConfigGetPayload<{
    select: {
      name: true;
      logo: true;
      email: true;
      phone_number: true;
      media: true;
    };
  }>;
};
export function UpdateConfig(props: Props) {
  const formSchema = z.object({
    config: z.object({
      name: z.string().min(3),

      phone_number: z
        .string()
        .regex(
          new RegExp(
            /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
          ),
          {
            message: "Invalid phone number",
          }
        ),

      logo: z.string().optional().nullable(),
      email: z.string().email(),
    }),

    file: fileZod.optional().nullable(),
  });

  const [isPadding, setTransition] = useTransition();
  const store = useStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      config: props.config,
    },
  });

  const watch = useWatch({ control: form.control });
  const defaultImage = useMemo(() => {
    const file = watch.file;
    const logo = watch.config.logo;

    if (file) {
      return URL.createObjectURL(file);
    } else if (logo) {
      return `/api/media/${logo}`;
    }
  }, [watch]);
  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      var dataForm = new FormData();
      if (!values.file && !values.config.logo) {
        return form.setError("file", { type: "required", message: "required" });
      }
      if (values.file) {
        dataForm.append("file", values.file);
      } else {
        dataForm = undefined;
      }
      setTransition(async () => {
        const res = await editConfig({
          config: values.config,
          file: dataForm,
          id: props.id,
        });
        store.OpenAlert({ ...res });

        Object.keys(res.errors ?? []).map((e) => {
          form.setError(e as any, res[e]);
        });
      });
    },
    [form, store, props.id]
  );
  return (
    <div className="flex justify-center items-center">
      <Card className="w-[350px] overflow-y-auto mt-3  max-h-[100vh] ">
        <CardHeader
          title={
            <div>
              <h1>Update Config Form</h1>
            </div>
          }
        ></CardHeader>
        <CardContent>
          <form
            autoComplete="off"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3"
          >
            <Controller
              control={form.control}
              name="config.name"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"App Name"}
                  placeholder="app name"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              control={form.control}
              name="config.email"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Email"}
                  placeholder="email"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="config.phone_number"
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                  label={"Phone Number"}
                  placeholder="phone number"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
            <Controller
              control={form.control}
              name="file"
              render={({ field, fieldState }) => (
                <>
                  {!defaultImage && (
                    <MuiFileInput
                      value={field.value}
                      label={"Append File"}
                      {...field}
                      error={Boolean(fieldState.error)}
                      helperText={fieldState?.error?.message}
                      clearIconButtonProps={{
                        children: <MdClose fontSize="small" />,
                      }}
                      InputProps={{
                        inputProps: {
                          accept: "image/*",
                        },
                        startAdornment: <MdAttachFile />,
                      }}
                    />
                  )}

                  <div className="mt-3">
                    {defaultImage && typeof defaultImage === "string" ? (
                      <div>
                        <LoadingButton
                          color="error"
                          loading={isPadding}
                          onClick={() => {
                            setTransition(async () => {
                              field.onChange();
                              form.setValue("config.logo", undefined);
                            });
                          }}
                          startIcon={<MdDelete />}
                        ></LoadingButton>
                        <Image
                          width={60}
                          height={60}
                          alt="logo"
                          src={defaultImage}
                          className="rounded-md object-contain   border w-full h-full "
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              )}
            />
            <div className="flex justify-end">
              <LoadingButton
                variant="contained"
                fullWidth
                className={
                  isPadding
                    ? ""
                    : "hover:bg-blue-gray-900  hover:text-brown-50 capitalize bg-black text-white "
                }
                disableElevation
                type="submit"
                loading={isPadding}
              >
                Save
              </LoadingButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
