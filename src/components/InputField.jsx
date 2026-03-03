import React from 'react';

export default function InputField({ label, prefix, suffix, children, ...inputProps }) {
  // If children is provided (e.g. a <select>), render that instead of <input>
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <div className="input-wrap">
        {prefix && <span className="input-prefix">{prefix}</span>}
        {children || <input type="number" {...inputProps} />}
        {suffix && <span className="input-suffix">{suffix}</span>}
      </div>
    </div>
  );
}
