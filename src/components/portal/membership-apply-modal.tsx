'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useApi } from '@/lib/hooks/use-api';
import { api } from '@/lib/api/client';
import { useToast } from '@/lib/context/toast-context';
import { X, CheckCircle2, MapPin } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface MembershipInfoRegion {
  id: string;
  name: string;
  slug: string;
  country?: string | null;
}

interface MembershipInfoResponse {
  isMember: boolean;
  regions: MembershipInfoRegion[];
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function MembershipApplyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: info } = useApi<MembershipInfoResponse>(
    open && user ? '/api/portal/membership/info' : '',
    { immediate: open && !!user },
  );

  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedRegion('');
      setSuccess(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedRegion) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/portal/membership/apply', {
        regionId: selectedRegion,
        isPrimary: true,
      });
      if (res.success) {
        setSuccess(true);
        addToast('success', 'Application submitted successfully!');
      } else {
        addToast('error', (res.error as any)?.message || 'Failed to submit application');
      }
    } catch {
      addToast('error', 'Something went wrong');
    }
    setSubmitting(false);
  };

  if (!open) return null;

  const regions = info?.regions || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          style={{ animation: 'modalSlideUp 0.3s ease' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Apply for Membership
            </h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {success ? (
            /* ── Success State ────────────────────────────── */
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Application Submitted!</h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                Your membership application has been submitted. A region lead will review it shortly.
              </p>
              <button
                onClick={onClose}
                className="mt-3 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* ── Form ─────────────────────────────────────── */
            <>
              {!user ? (
                <p className="text-sm text-zinc-500 py-6 text-center">
                  Please log in to apply for membership.
                </p>
              ) : (
                <>
                  {/* Region Selection */}
                  <div className="mb-5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Select Region *
                    </label>
                    {regions.length === 0 ? (
                      <div className="py-6 text-center text-sm text-zinc-400">
                        Loading regions...
                      </div>
                    ) : (
                      <div className="grid gap-2 max-h-[240px] overflow-y-auto pr-1">
                        {regions.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => setSelectedRegion(r.id)}
                            className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                              selectedRegion === r.id
                                ? 'border-[#FF394A]/50 bg-[#FF394A]/5 text-zinc-900 dark:text-white'
                                : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            <MapPin className={`h-3.5 w-3.5 shrink-0 ${selectedRegion === r.id ? 'text-[#FF394A]' : 'text-zinc-400'}`} />
                            <span className="flex-1">{r.name}</span>
                            {r.country && (
                              <span className="text-xs text-zinc-400">{r.country}</span>
                            )}
                            {selectedRegion === r.id && (
                              <CheckCircle2 className="h-4 w-4 text-[#FF394A] shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedRegion || submitting}
                    className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>

                  <p className="mt-3 text-[10px] text-center text-zinc-400">
                    By applying, you agree this is a <b className="text-zinc-500 dark:text-zinc-300">volunteer opportunity</b>. As a member, you may earn bounties or grants for contributions.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Inline keyframes */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
