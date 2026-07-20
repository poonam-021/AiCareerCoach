import { useState } from "react";

export default function FormField({ id, label, type = "text", value, onChange, autoComplete, isPassword = false }) {
  const [visible, setVisible] = useState(false);
  const inputType = isPassword ? (visible ? "text" : "password") : type;

  return (
    <div className="auth-field">
      <input
        id={id}
        type={inputType}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className={value ? "has-value" : ""}
        placeholder=" "
        required
      />
      <label htmlFor={id}>{label}</label>
      {isPassword && (
        <button type="button" className="auth-toggle-visibility" onClick={() => setVisible((v) => !v)} tabIndex={-1}>
          {visible ? "HIDE" : "SHOW"}
        </button>
      )}
    </div>
  );
}