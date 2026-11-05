import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import axios from "axios";
import { API_BASE } from "../../config.js";
import { auth } from "../../firebase.js";
import { authenticate, errMsg, successMsg } from "../../Utils/helpers.jsx";
import { loginSchema } from "../../Utils/validation.js";
import {
  loginSuccess,
  userFail,
  userRequest,
} from "../../actions/userActions.jsx";

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: loading },
  } = useForm({ resolver: yupResolver(loginSchema) });
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const finishLogin = async (credential) => {
    const token = await credential.user.getIdToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const { data } = await axios.post(
      `${API_BASE}/users/sync`,
      {
        name:
          credential.user.displayName || credential.user.email.split("@")[0],
      },
      { ...config, withCredentials: true },
    );
    authenticate({ token, user: data.user });
    dispatch(loginSuccess(data.user));
    successMsg("Signed in");
    navigate(data.user.role === "admin" ? "/dashboard" : "/");
  };
  const submit = async ({ email, password }) => {
    dispatch(userRequest());
    try {
      await finishLogin(
        await signInWithEmailAndPassword(auth, email, password),
      );
    } catch (error) {
      dispatch(userFail(error?.message || "Unable to sign in"));
      errMsg(error);
    }
  };
  const googleLogin = async () => {
    setGoogleLoading(true);
    try {
      await finishLogin(await signInWithPopup(auth, new GoogleAuthProvider()));
    } catch (error) {
      errMsg(error);
    } finally {
      setGoogleLoading(false);
    }
  };
  return (
    <main className="container">
      <form
        className="filter-panel"
        onSubmit={handleSubmit(submit)}
        style={{ maxWidth: 520, margin: "20px auto" }}
      >
        <div className="eyebrow">Firebase Authentication</div>
        <h1>Sign in</h1>
        <label>
          Email
          <input
            type="email"
            {...register("email")}
          />
          {errors.email && <small role="alert">{errors.email.message}</small>}
        </label>
        <label>
          Password
          <input
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <small role="alert">{errors.password.message}</small>
          )}
        </label>
        <button className="add" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <button
          type="button"
          className="category active"
          style={{ width: "100%", textAlign: "center", marginTop: 10 }}
          disabled={loading || googleLoading}
          onClick={googleLogin}
        >
          Continue with Google
        </button>
        <p className="muted">
          No account? <Link to="/register">Create one</Link> ·{" "}
          <Link to="/password/forgot">Reset password</Link>
        </p>
      </form>
    </main>
  );
};
export default Login;
