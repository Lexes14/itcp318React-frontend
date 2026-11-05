import * as yup from "yup";

export const productCategories = [
  "Line-Interactive UPS",
  "Online Double-Conversion UPS",
  "Standby UPS",
  "Replacement Batteries",
  "Surge Protectors",
  "Power Inverters",
  "Voltage Regulators (AVR)",
  "Solar Batteries",
  "Rack Accessories",
  "Cables & Connectors",
];
export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
export const profileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or less")
    .required("Name is required"),
});
export const productSchema = yup.object({
  name: yup.string().trim().max(120).required("Name is required"),
  slug: yup
    .string()
    .trim()
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens")
    .required("Slug is required"),
  brand: yup.string().trim().max(80).required("Brand is required"),
  model: yup.string().trim().max(80),
  sku: yup.string().trim().max(60).required("SKU is required"),
  price: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Price must be a number")
    .min(0, "Price cannot be negative")
    .required("Price is required"),
  salePrice: yup
    .number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Sale price must be a number")
    .min(0, "Sale price cannot be negative")
    .test(
      "sale-price-not-higher",
      "Sale price cannot be higher than price",
      (value, context) =>
        value === undefined ||
        value === null ||
        value === "" ||
        context.parent.price === undefined ||
        value <= context.parent.price,
    ),
  stock: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" ? undefined : value,
    )
    .typeError("Stock must be a number")
    .integer("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
  category: yup
    .string()
    .oneOf(productCategories, "Select a valid category")
    .required("Category is required"),
  description: yup
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or less")
    .required("Description is required"),
});
export const productUpdateSchema = productSchema.shape({
  name: productSchema.fields.name.notRequired(),
  slug: productSchema.fields.slug.notRequired(),
  brand: productSchema.fields.brand.notRequired(),
  model: productSchema.fields.model.notRequired(),
  sku: productSchema.fields.sku.notRequired(),
  price: productSchema.fields.price.notRequired(),
  stock: productSchema.fields.stock.notRequired(),
  category: productSchema.fields.category.notRequired(),
  description: productSchema.fields.description.notRequired(),
});
export const validate = async (schema, value) => {
  try {
    await schema.validate(value, { abortEarly: false });
    return null;
  } catch (error) {
    return error.errors.join(", ");
  }
};
