'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Plus, ChevronUp, ChevronDown, X } from 'lucide-react';

export interface FormFieldDef {
  label: string;
  type: 'text' | 'textarea' | 'email' | 'number' | 'select' | 'checkbox' | 'url';
  required: boolean;
  options?: string[];
}

const FIELD_TYPES: FormFieldDef['type'][] = ['text', 'textarea', 'email', 'number', 'select', 'checkbox', 'url'];

interface FormFieldBuilderProps {
  fields: FormFieldDef[];
  onChange: (fields: FormFieldDef[]) => void;
}

export function FormFieldBuilder({ fields, onChange }: FormFieldBuilderProps) {
  const addField = () => onChange([...fields, { label: '', type: 'text', required: false }]);

  const removeField = (idx: number) => onChange(fields.filter((_, i) => i !== idx));

  const updateField = (idx: number, updates: Partial<FormFieldDef>) => {
    onChange(fields.map((f, i) => i === idx ? { ...f, ...updates } : f));
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const next = idx + dir;
    if (next < 0 || next >= fields.length) return;
    const copy = [...fields];
    [copy[idx], copy[next]] = [copy[next], copy[idx]];
    onChange(copy);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-500">Form Fields (optional)</label>
        <button type="button" onClick={addField} className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600">
          <Plus className="h-3 w-3" /> Add Field
        </button>
      </div>
      {fields.length === 0 ? (
        <p className="py-3 text-center text-xs text-zinc-500">No form fields. Add fields to collect data from users.</p>
      ) : (
        <div className="space-y-2">
          {fields.map((field, idx) => (
            <div key={idx} className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50/50 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/30">
              <div className="flex flex-col gap-0.5 pt-1.5">
                <button type="button" onClick={() => moveField(idx, -1)} disabled={idx === 0} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30">
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => moveField(idx, 1)} disabled={idx === fields.length - 1} className="text-zinc-400 hover:text-zinc-600 disabled:opacity-30">
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    placeholder="Field label"
                    className="col-span-1"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => updateField(idx, { type: e.target.value as FormFieldDef['type'] })}
                    className="h-10 rounded-lg border border-zinc-200 bg-card px-2 text-xs dark:border-zinc-800"
                  >
                    {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <input type="checkbox" checked={field.required} onChange={(e) => updateField(idx, { required: e.target.checked })} className="rounded border-zinc-300" />
                    Required
                  </label>
                </div>
                {field.type === 'select' && (
                  <Input
                    value={field.options?.join(', ') || ''}
                    onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                    placeholder="Options (comma-separated)"
                  />
                )}
              </div>
              <button type="button" onClick={() => removeField(idx)} className="text-zinc-400 hover:text-red-500 mt-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
