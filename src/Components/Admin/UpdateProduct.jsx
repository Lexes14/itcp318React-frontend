import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { API_BASE } from "../../config.js";
import { authConfig, errMsg, successMsg } from "../../Utils/helpers.jsx";
import { productUpdateSchema } from "../../Utils/validation.js";

const editableFields = [
  "name",
  "slug",
  "brand",
  "model",
  "sku",
  "price",
  "salePrice",
  "stock",
  "category",
  "description",
];
const validImages = (files) =>
  files.length <= 10 &&
  files.every(
    (file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type) &&
      file.size <= 5 * 1024 * 1024,
  );

const UpdateProduct = ({ product, onSaved, onCancel }) => {
  const [form, setForm] = useState(product);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(productUpdateSchema) });

  useEffect(() => {
    setForm(product);
    reset(product);
  }, [product, reset]);

  if (!product || !form) return null;

  const removeImage = async (image) => {
    try {
      await axios.delete(
        `${API_BASE}/admin/product/${product._id}/image/${image._id}`,
        { ...authConfig(), withCredentials: true },
      );
      setForm((current) => ({
        ...current,
        images: current.images.filter((item) => item._id !== image._id),
      }));
      successMsg("Image removed");
    } catch (error) {
      errMsg(error);
    }
  };

  const submit = async (values) => {
    setSaving(true);
    try {
      const payload = new FormData();
      editableFields.forEach((field) => {
        const value = values[field];
        if (value !== undefined && value !== null && value !== "") {
          payload.append(field, typeof value === "string" ? value.trim() : value);
        }
      });
      images.forEach((image) => payload.append("images", image));
      await axios.put(`${API_BASE}/admin/product/${product._id}`, payload, {
        ...authConfig(),
        withCredentials: true,
      });
      successMsg("Product updated");
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
        <h2>Update product</h2>
        <button type="button" className="admin-button secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
      <form className="admin-form" onSubmit={handleSubmit(submit)}>
        <div className="form-grid">
          {editableFields
            .filter((name) => name !== "description")
            .map((name) => (
              <label key={name}>
                {name}
                <input
                  {...register(name)}
                  type={["price", "salePrice", "stock"].includes(name) ? "number" : "text"}
                />
                {errors[name] && <small role="alert">{errors[name].message}</small>}
              </label>
            ))}
          <label>
            Additional images
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={imageChange} />
            {errors.images && <small role="alert">{errors.images.message}</small>}
          </label>
        </div>
        <div className="image-manager">
          <strong>Current images</strong>
          <div className="image-manager-grid">
            {form.images?.length ? (
              form.images.map((image) => (
                <div className="managed-image" key={image._id}>
                  <img src={image.url} alt="Product" />
                  <button type="button" className="image-remove" onClick={() => removeImage(image)}>
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <span className="muted">No images uploaded.</span>
            )}
          </div>
          {images.length > 0 && (
            <p className="muted">{images.length} new image(s) selected. They will be added when you save.</p>
          )}
        </div>
        <label>
          Description
          <textarea {...register("description")} rows="4" />
          {errors.description && <small role="alert">{errors.description.message}</small>}
        </label>
        <button className="admin-button" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
};
export default UpdateProduct;
