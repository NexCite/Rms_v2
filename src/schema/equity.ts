import { z } from "zod";

export const EquitySchema = z.object({
  description: z.string().min(3),
  to_date: z.date(),
  coverage: z.array(
    z.object({
      account: z.string(),
      starting_float: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
      current_float: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
      closed_p_l: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    })
  ),
  managers: z.array(
    z.object({
      manger: z
        .string()
        .min(1, { message: "Manager must be at least 1 characters" }),
      starting_float: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
      current_float: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
      p_l: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
      commission: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
      swap: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    })
  ),
  agents: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: "Name must be at least 1 characters" }),
      commission: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    })
  ),
  p_l: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: "Name must be at least 1 characters" }),
      p_l: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    })
  ),
  expensive: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: "Name must be at least 1 characters" }),
      expensive: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    })
  ),
  credit: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: "Name must be at least 1 characters" }),
      credit: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    })
  ),
  adjustment: z.array(
    z.object({
      name: z
        .string()
        .min(1, { message: "Name must be at least 1 characters" }),
      adjustment: z.number().or(
        z
          .string()
          .regex(/^-?\d+(\.\d{1,2})?$/)
          .transform(Number)
      ),
    })
  ),
});

export type EquitySchema = z.infer<typeof EquitySchema>;
