import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { API_BASE } from "../../config.js";
import { authConfig, errMsg, successMsg } from "../../Utils/helpers.jsx";
import { productSchema } from "../../Utils/validation.js";

const categories = [
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
const initial = {
  name: "",
  slug: "",
  brand: "",
  model: "",
  description: "",
  price: "",
  salePrice: "",
  stock: "",
  sku: "",
  category: categories[0],
};
const validImages = (files) =>
  files.length <= 10 &&
  files.every(
    (file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
      file.size <= 5 * 1024 * 1024,
  );

const NewProduct = ({ onSaved, onCancel }) => {
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(productSchema), defaultValues: initial });

  const submit = async (form) => {
    setSaving(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));
      images.forEach((image) => body.append("images", image));
      await axios.post(`${API_BASE}/admin/product/new`, body, {
        ...authConfig(),
        withCredentials: true,
      });
      successMsg("Product created");
      reset(initial);
      setImages([]);
      onSaved();
    } catch (error) {
      Object.entries(error.response?.data?.errors || {}).forEach(
        ([field, message]) => setError(field, { type: "server", message }),
      );
      errMsg(error);
    } finally {
      setSaving(false);
    }
  };
  const imageChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!validImages(files)) {
      setError("images", {
        type: "validate",
        message:
          "Select up to 10 JPEG, PNG, or WebP images, each 5 MB or smaller",
      });
      setImages([]);
      return;
    }
    clearErrors("images");
    setImages(files);
  };

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h2>New product</h2>
        <button type="button" className="admin-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit(submit)}>
        <div className="form-grid">
          {[
            ["name", "Name"],
            ["slug", "Slug"],
            ["brand", "Brand"],
            ["model", "Model"],
            ["sku", "SKU"],
            ["price", "Price"],
            ["salePrice", "Sale price"],
            ["stock", "Stock"],
          ].map(([name, label]) => (
            <label key={name}>
              {label}
              <input
                {...register(name)}
                type={["price", "salePrice", "stock"].includes(name) ? "number" : "text"}
              />
              {errors[name] && <small role="alert">{errors[name].message}</small>}
            </label>
          ))}
          <label>
            Category
            <select {...register("category")}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            {errors.category && <small role="alert">{errors.category.message}</small>}
          </label>
          <label>
            Images
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={imageChange} />
            {errors.images && <small role="alert">{errors.images.message}</small>}
          </label>
        </div>
        {images.length > 0 && (
          <div className="image-manager">
            <strong>Selected images</strong>
            <p className="muted">{images.length} image(s) will be uploaded to Cloudinary.</p>
            <div className="image-manager-grid">
              {images.map((image) => (
                <div className="managed-image" key={`${image.name}-${image.lastModified}`}>
                  <img src={URL.createObjectURL(image)} alt={image.name} />
                </div>
              ))}
            </div>
          </div>
        )}
        <label>
          Description
          <textarea {...register("description")} rows="4" />
          {errors.description && <small role="alert">{errors.description.message}</small>}
        </label>
        <button className="admin-button" disabled={saving}>
          {saving ? "Saving..." : "Create product"}
        </button>
      </form>
    </section>
  );
};
export default NewProduct;
