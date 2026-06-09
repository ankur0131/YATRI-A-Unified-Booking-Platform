function FormInput({ label, error, theme, ...props }) {
  const isLight = theme === "light";

  return (
    <label className="block">
      <span className={`mb-2 block text-sm font-medium ${isLight ? "text-neutral-700" : "text-white/80"}`}>
        {label}
      </span>
      <input
        {...props}
        className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition placeholder:text-current/40 ${
          isLight
            ? "border-neutral-900/10 bg-white text-neutral-900 focus:glow-ring"
            : "border-white/10 bg-white/6 text-white focus:glow-ring"
        } ${error ? "border-rose-400/35" : ""}`}
      />
      {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}
    </label>
  );
}

export default FormInput;
