import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FiLock, FiMail } from "react-icons/fi";
import { useLoginMutation } from "../api/authApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  selectIsAuthenticated,
  setCredentials,
} from "../features/auth/authSlice";
import "./LoginPage.css";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/yaglama-servisi" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await login({ email, password }).unwrap();

      if (!result.success || !result.data?.token) {
        setError(result.message || "Giriş başarısız.");
        return;
      }

      dispatch(
        setCredentials({
          token: result.data.token,
          user: {
            userId: result.data.userId,
            email: result.data.email,
            fullName: result.data.fullName,
          },
        }),
      );
      navigate("/yaglama-servisi", { replace: true });
    } catch (err) {
      const message =
        err &&
        typeof err === "object" &&
        "data" in err &&
        err.data &&
        typeof err.data === "object" &&
        "message" in err.data &&
        typeof err.data.message === "string"
          ? err.data.message
          : "Giriş yapılamadı. Bilgilerinizi kontrol edin.";
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__panel">
        <div className="login-page__brand">
          <span className="login-page__mark">B</span>
          <div>
            <h1>Bahar Oto</h1>
            <p>Admin Panel</p>
          </div>
        </div>

        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          <h2>Giriş Yap</h2>

          {error ? (
            <div className="login-page__error" role="alert">
              {error}
            </div>
          ) : null}

          <label className="login-page__field">
            <span>Kullanıcı Adı</span>
            <div className="login-page__input">
              <FiMail aria-hidden />
              <input
                type="text"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta veya kullanıcı adı"
                required
              />
            </div>
          </label>

          <label className="login-page__field">
            <span>Şifre</span>
            <div className="login-page__input">
              <FiLock aria-hidden />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Şifreniz"
                required
              />
            </div>
          </label>

          <button
            type="submit"
            className="login-page__submit"
            disabled={isLoading || !email || !password}
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
