// LabelUI/validationSchemas.js
import * as z from "zod";

export const LabelFormSchema = z.object({
  type_id: z.string().min(1, "Type is required"),
  labels: z.array(
    z.object({
      name: z.string().min(1, "Label name is required"),
    })
  ).min(1, "At least one label is required"),
  computable: z.enum(["yes", "no"]),
  expense_method: z.enum(["mileage", "amount"]),
});