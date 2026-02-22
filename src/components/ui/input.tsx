'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
          error ? 'border-red-500' : 'border-zinc-700'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
          error ? 'border-red-500' : 'border-zinc-700'
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, options, className = '', id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-zinc-300">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
          error ? 'border-red-500' : 'border-zinc-700'
        } ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
