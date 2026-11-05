import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { API_BASE } from "../../config.js";
import {
  authConfig,
  authenticate,
  errMsg,
  getUser,
  successMsg,
} from "../../Utils/helpers.jsx";
import "./Profile.css";
import { profileSchema } from "../../Utils/validation.js";
import {
  updateProfileSuccess,
  userFail,
  userRequest,
} from "../../actions/userActions.jsx";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm({ resolver: yupResolver(profileSchema) });
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`${API_BASE}/me`, { ...authConfig(), withCredentials: true })
      .then(({ data }) => {
        setUser(data.user);
        authenticate({ user: data.user });
        reset({ name: data.user.name || "" });
        setPreview(data.user.avatar?.url || "");
      })
      .catch(errMsg);
  }, [reset]);

  const selectAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("avatar", {
        type: "validate",
        message: "Avatar must be a JPEG, PNG, or WebP image",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("avatar", {
        type: "validate",
        message: "Avatar must be 5 MB or smaller",
      });
      return;
    }
    clearErrors("avatar");
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async ({ name }) => {
    setSaving(true);
    dispatch(userRequest());
    try {
      const form = new FormData();
      form.append("name", name.trim());
      if (avatar) form.append("avatar", avatar);
      const { data } = await axios.put(`${API_BASE}/me/update`, form, {
        ...authConfig(),
        withCredentials: true,
      });
      setUser(data.user);
      dispatch(updateProfileSuccess(data.user));
      setPreview(data.user.avatar?.url || "");
      successMsg("Profile updated");
    } catch (error) {
      dispatch(userFail(error?.message || "Unable to update profile"));
      Object.entries(error.response?.data?.errors || {}).forEach(
        ([field, message]) => {
          setError(field, { type: "server", message });
        },
      );
      errMsg(error);
    } finally {
      setSaving(false);
    }
  };

  if (!user && !getUser()) return <Navigate to="/login" replace />;
  if (!user)
    return (
      <main className="container">
        <div className="skeleton" />
      </main>
    );
  return (
    <main className="container">
      <section className="profile-panel">
        <div className="eyebrow">Account / Profile</div>
        <h1>Your profile</h1>
        <div className="profile-layout">
          <div className="profile-avatar">
            {preview ? (
              <img src={preview} alt={user.name} />
            ) : (
              <span>{user.name?.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <form className="admin-form" onSubmit={handleSubmit(submit)}>
            <label>
              Full name
              <input {...register("name")} />
              {errors.name && <small role="alert">{errors.name.message}</small>}
            </label>
            <label>
              Email
              <input value={user.email} readOnly />
            </label>
            <label>
              Account role
              <input value={user.role} readOnly />
            </label>
            <label>
              Profile picture
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={selectAvatar}
              />
              {errors.avatar && (
                <small role="alert">{errors.avatar.message}</small>
              )}
            </label>
            <button className="add" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
export default Profile;
