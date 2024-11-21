import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium text-gray-500">{label}</span>
        </label>
      )}

      <input
        ref={ref}
        className={`
          w-full px-4 py-2.5
          border border-gray-300 text-sm outline-none focus:border-blue-500
        `}
        {...props}
      />

      {error && (
        <label className="label">
          <span className="label-text-alt text-red-500 text-sm font-medium">
            {error}
          </span>
        </label>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
