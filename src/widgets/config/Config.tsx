"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Check from "@mui/icons-material/Check";
import UploadFile from "@mui/icons-material/UploadFile";
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Step,
  StepButton,
  StepIndicator,
  Stepper,
  Typography,
} from "@mui/joy";
import LoadingButton from "@mui/lab/LoadingButton";
import IConfig from "@nexcite/Interfaces/IConfig";
import NexCiteButton from "@nexcite/components/button/NexCiteButton";
import { useToast } from "@nexcite/hooks/toast-hook";
import {
  ConfigInputSchema,
  ConfigInputUpdateSchema,
} from "@nexcite/schema/ConfigSchema";
import { updateConfig } from "@nexcite/service/ConfigService";
import { editConfig, initConfig } from "@nexcite/service/config-service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { MdArrowBack } from "react-icons/md";
import z from "zod";
const validImageExtensions = /\.(gif|jpe?g|tiff?|png|webp|bmp|ico)$/i;
const steps = ["Project", "Company Information", "User Information"];

export function InitConfig() {
  const fileRef = useRef<HTMLInputElement>();
  const formSchema = ConfigInputSchema;

  const [activeStep, setActiveStep] = useState(0);

  const [isPadding, setTransition] = useTransition();
  const toast = useToast();
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
        toast.OpenAlert({ ...res });
        if (res?.status === 200) replace("/login");
        Object.keys(res?.errors ?? []).map((e) => {
          form.setError(e as any, res[e]);
        });
      });
    },
    [replace, form, toast]
  );
  return (
    <div className="flex justify-center items-center mt-4">
      <Card className="w-full max-w-[650px] m-auto">
        <div className="flex  items-center gap-2">
          {activeStep > 0 ? (
            <IconButton
              type="button"
              onClick={() => {
                setActiveStep(activeStep - 1);
              }}
            >
              <MdArrowBack />
            </IconButton>
          ) : (
            <div></div>
          )}
          <Typography>Setup New Project</Typography>
        </div>
        <Divider />
        <Stepper sx={{ width: "100%" }}>
          {steps.map((step, index) => (
            <Step
              key={step}
              indicator={
                <StepIndicator
                  variant={activeStep <= index ? "soft" : "solid"}
                  color={activeStep < index ? "neutral" : "primary"}
                >
                  {activeStep <= index ? index + 1 : <Check />}
                </StepIndicator>
              }
              sx={{
                "&::after": {
                  ...(activeStep > index &&
                    index !== 2 && { bgcolor: "primary.solidBg" }),
                },
              }}
            >
              <StepButton disabled={true} onClick={() => setActiveStep(index)}>
                {step}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <div>
          <form
            className="flex flex-col gap-5 mt-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {activeStep === 0 && (
              <>
                <Controller
                  control={form.control}
                  name="config.name"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>App Name</FormLabel>
                      <Input
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
              </>
            )}
            {activeStep === 1 && (
              <>
                <Controller
                  control={form.control}
                  name="config.email"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>Email</FormLabel>
                      <Input
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  control={form.control}
                  name="config.phone_number"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>Phone Number</FormLabel>
                      <Input
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  control={form.control}
                  name="file"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>Logo</FormLabel>

                      <input
                        type="file"
                        ref={fileRef}
                        name="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (validImageExtensions.test(file.name)) {
                            field.onChange(file);
                          } else {
                            field.onChange(undefined);
                          }
                        }}
                      />
                      <label htmlFor="file" className="w-full">
                        <Button
                          className="w-full"
                          variant="outlined"
                          color={fieldState.error ? "danger" : "neutral"}
                          onClick={(e) => {
                            fileRef.current.click();
                          }}
                          startDecorator={
                            watch.file?.name ? <></> : <UploadFile />
                          }
                        >
                          {watch.file?.name ?? "Upload File"}
                        </Button>
                      </label>

                      <div>
                        {defaultImage && (
                          <Image
                            src={defaultImage}
                            alt={watch.config.name}
                            width={100}
                            height={100}
                            className="max-w-[300px] w-full rounded-md border m-auto mt-5"
                          />
                        )}
                      </div>
                    </FormControl>
                  )}
                />
              </>
            )}
            {activeStep === 2 && (
              <>
                <Controller
                  control={form.control}
                  name="config.username"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>Username</FormLabel>
                      <Input
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  control={form.control}
                  name="config.password"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>Password</FormLabel>
                      <Input
                        name="new-password"
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                        type="password"
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  control={form.control}
                  name="config.first_name"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>Frist Name</FormLabel>
                      <Input
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
                <Controller
                  control={form.control}
                  name="config.last_name"
                  render={({ field, fieldState }) => (
                    <FormControl error={Boolean(fieldState.error)}>
                      <FormLabel required>Last Name</FormLabel>
                      <Input
                        {...field}
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  )}
                />
              </>
            )}
          </form>
        </div>
        <Divider />
        <form
          className="flex items-end justify-between"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {activeStep < 2 && (
            <NexCiteButton
              type="button"
              onClick={() => {
                if (activeStep === 0) {
                  const name = form.getValues("config").name;
                  if (!z.string().min(3).safeParse(name).success) {
                    form.setError("config.name", {
                      type: "required",
                      message: "required",
                    });
                    return;
                  } else {
                    form.clearErrors("config.name");
                  }
                } else if (activeStep === 1) {
                  const email = form.getValues("config.email");
                  const phone_number = form.getValues("config.phone_number");
                  const file = form.getValues("file");

                  if (!file) {
                    form.setError("file", {
                      type: "required",
                      message: "required",
                    });

                    return;
                  }
                  if (
                    !z.string().min(3).safeParse(phone_number).success ||
                    !z.string().email().safeParse(email).success
                  ) {
                    if (!z.string().min(3).safeParse(phone_number).success) {
                      form.setError("config.phone_number", {
                        type: "required",
                        message: "required",
                      });
                      form.clearErrors("config.email");
                    } else {
                      form.clearErrors("config.phone_number");

                      form.setError("config.email", {
                        type: "required",
                        message: "required",
                      });
                    }

                    return;
                  } else {
                    form.clearErrors("config.phone_number");
                    form.clearErrors("config.email");
                    form.clearErrors("file");
                  }
                }

                setActiveStep(activeStep + 1);
              }}
            >
              Next
            </NexCiteButton>
          )}
          {activeStep === 2 && (
            <NexCiteButton type="submit" isPadding={isPadding}>
              create
            </NexCiteButton>
          )}
        </form>
      </Card>
    </div>
  );
}

type Props = {
  config: IConfig;
};
export function UpdateConfig(props: Props) {
  const fileRef = useRef<HTMLInputElement>();
  const formSchema = ConfigInputUpdateSchema;

  const [isPadding, setTransition] = useTransition();
  const toast = useToast();

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
      delete values.file;
      setTransition(async () => {
        const res = await updateConfig(props.config.id, {
          data: values,
          file: dataForm,
        });
        toast.OpenAlert({ ...res });
        if (res.status === 400) {
          Object.keys(res.error).map((e) => {
            form.setError(e as any, res[e]);
          });
        }
      });
    },
    [form, toast, props.config.id]
  );
  return (
    <Box sx={{ maxWidth: 350, margin: "auto" }}>
      <Card>
        <Typography>Project Form</Typography>

        <form
          autoComplete="off"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3"
        >
          <Controller
            control={form.control}
            name="config.name"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel>Project Name</FormLabel>
                <Input
                  fullWidth
                  value={field.value}
                  onChange={(e) => field.onChange}
                />
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="config.email"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel>Email</FormLabel>
                <Input
                  fullWidth
                  value={field.value}
                  onChange={(e) => field.onChange}
                />
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            control={form.control}
            name="config.phone_number"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel> Phone Number</FormLabel>
                <Input
                  fullWidth
                  value={field.value}
                  onChange={(e) => field.onChange}
                />
                <FormHelperText>{fieldState.error?.message}</FormHelperText>
              </FormControl>
            )}
          />

          <Controller
            control={form.control}
            name="file"
            render={({ field, fieldState }) => (
              <FormControl error={Boolean(fieldState.error)}>
                <FormLabel required>Logo</FormLabel>

                <input
                  type="file"
                  ref={fileRef}
                  name="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (validImageExtensions.test(file.name)) {
                      field.onChange(file);
                    } else {
                      field.onChange(undefined);
                    }
                  }}
                />
                <label htmlFor="file" className="w-full">
                  <Button
                    className="w-full"
                    variant="outlined"
                    color={fieldState.error ? "danger" : "neutral"}
                    onClick={(e) => {
                      fileRef.current.click();
                    }}
                    startDecorator={watch.file?.name ? <></> : <UploadFile />}
                  >
                    {watch.file?.name ?? "Upload File"}
                  </Button>
                </label>

                <div>
                  {defaultImage && (
                    <Image
                      src={defaultImage}
                      alt={watch.config.name}
                      width={100}
                      height={100}
                      className="max-w-[300px] w-full rounded-md border m-auto mt-5"
                    />
                  )}
                </div>
              </FormControl>
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
      </Card>
    </Box>
  );
}
