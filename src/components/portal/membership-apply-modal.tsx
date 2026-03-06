'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { api } from '@/lib/api/client';
import { useToast } from '@/lib/context/toast-context';
import { X, CheckCircle2, Plus, BadgeCheck } from 'lucide-react';
import { COUNTRIES, STATES_BY_COUNTRY } from '@/lib/data/countries-states';

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function MembershipApplyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [consent, setConsent] = useState(false);

  // Form fields
  const [telegram, setTelegram] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [whyJoin, setWhyJoin] = useState('');
  const [howHelp, setHowHelp] = useState('');
  const [expectations, setExpectations] = useState('');
  const [hoursWeekly, setHoursWeekly] = useState('');
  const [github, setGithub] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // Reset on open
  useEffect(() => {
    if (open) {
      setSuccess(false);
      setConsent(false);
      setTelegram('');
      setXHandle('');
      setCountry('');
      setState('');
      setBio('');
      setResumeLink('');
      setSkills([]);
      setSkillInput('');
      setWhyJoin('');
      setHowHelp('');
      setExpectations('');
      setHoursWeekly('');
      setGithub('');
      setReferredBy('');
    }
  }, [open]);

  // Reset state when country changes
  useEffect(() => {
    setState('');
  }, [country]);

  const stateOptions = STATES_BY_COUNTRY[country] || [];

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setSkillInput('');
  }, [skillInput, skills]);

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const isFormValid =
    telegram.trim() &&
    xHandle.trim() &&
    country &&
    state &&
    bio.trim().length >= 10 &&
    resumeLink.trim() &&
    skills.length > 0 &&
    whyJoin.trim().length >= 10 &&
    howHelp.trim().length >= 10 &&
    expectations.trim().length >= 10 &&
    Number(hoursWeekly) > 0 &&
    consent;

  const handleSubmit = async () => {
    if (!isFormValid || !user) return;
    setSubmitting(true);
    try {
      const res = await api.post('/api/portal/membership/apply', {
        fullName: user.displayName,
        email: user.email,
        telegram: telegram.trim(),
        xHandle: xHandle.trim(),
        country,
        state,
        bio: bio.trim(),
        resumeLink: resumeLink.trim(),
        skills,
        whyJoin: whyJoin.trim(),
        howHelp: howHelp.trim(),
        expectations: expectations.trim(),
        hoursWeekly: Number(hoursWeekly),
        github: github.trim() || undefined,
        referredBy: referredBy.trim() || undefined,
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

  const inputClass =
    'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-[#FF394A]/50 focus:outline-none focus:ring-1 focus:ring-[#FF394A]/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500';
  const labelClass = 'block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5';
  const sectionClass = 'mb-6';
  const sectionTitleClass = 'text-sm font-bold text-zinc-900 dark:text-white mb-3 pb-2 border-b border-zinc-100 dark:border-zinc-800';

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
          className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          style={{ animation: 'modalSlideUp 0.3s ease' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
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
            /* Success State */
            <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">Application Submitted!</h3>
              <p className="text-sm text-zinc-500 max-w-xs">
                Your membership application has been submitted. Our team will review it and get back to you.
              </p>
              <button
                onClick={onClose}
                className="mt-3 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {!user ? (
                <p className="text-sm text-zinc-500 py-6 px-6 text-center">
                  Please log in to apply for membership.
                </p>
              ) : (
                <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
                  {/* ── Personal Details ── */}
                  <div className={sectionClass}>
                    <h3 className={sectionTitleClass}>Personal Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Full Name (readonly) */}
                      <div>
                        <label className={labelClass}>Full Name *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={user.displayName}
                            readOnly
                            className={`${inputClass} bg-zinc-50 dark:bg-zinc-900/50 pr-24 cursor-not-allowed`}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </span>
                        </div>
                      </div>

                      {/* Email (readonly) */}
                      <div>
                        <label className={labelClass}>Email *</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={user.email}
                            readOnly
                            className={`${inputClass} bg-zinc-50 dark:bg-zinc-900/50 pr-24 cursor-not-allowed`}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600 dark:text-green-400">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </span>
                        </div>
                      </div>

                      {/* Telegram */}
                      <div>
                        <label className={labelClass}>Telegram Handle *</label>
                        <input
                          type="text"
                          value={telegram}
                          onChange={(e) => setTelegram(e.target.value)}
                          placeholder="@username"
                          className={inputClass}
                        />
                      </div>

                      {/* X Handle */}
                      <div>
                        <label className={labelClass}>X Handle *</label>
                        <input
                          type="text"
                          value={xHandle}
                          onChange={(e) => setXHandle(e.target.value)}
                          placeholder="@username"
                          className={inputClass}
                        />
                      </div>

                      {/* Country */}
                      <div>
                        <label className={labelClass}>Country *</label>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c.value} value={c.label}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* State */}
                      <div>
                        <label className={labelClass}>State / Province *</label>
                        {stateOptions.length > 0 ? (
                          <select
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className={inputClass}
                          >
                            <option value="">Select state</option>
                            {stateOptions.map((s) => (
                              <option key={s.value} value={s.label}>{s.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="Enter state or province"
                            className={inputClass}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Experience & Skills ── */}
                  <div className={sectionClass}>
                    <h3 className={sectionTitleClass}>Experience & Skills</h3>
                    <div className="space-y-4">
                      {/* Bio */}
                      <div>
                        <label className={labelClass}>Short Bio / About You *</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          placeholder="Tell us about yourself, your background, and what you're working on..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      {/* Resume Link */}
                      <div>
                        <label className={labelClass}>Resume / Portfolio Link *</label>
                        <input
                          type="url"
                          value={resumeLink}
                          onChange={(e) => setResumeLink(e.target.value)}
                          placeholder="https://..."
                          className={inputClass}
                        />
                      </div>

                      {/* Skills */}
                      <div>
                        <label className={labelClass}>Top Skills *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillKeyDown}
                            placeholder="Type a skill and press Enter"
                            className={`${inputClass} flex-1`}
                          />
                          <button
                            type="button"
                            onClick={addSkill}
                            className="flex items-center justify-center h-[42px] w-[42px] rounded-lg border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        {skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                              >
                                {skill}
                                <button
                                  type="button"
                                  onClick={() => removeSkill(skill)}
                                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Community Fit ── */}
                  <div className={sectionClass}>
                    <h3 className={sectionTitleClass}>Community Fit</h3>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Why do you want to be a member? *</label>
                        <textarea
                          value={whyJoin}
                          onChange={(e) => setWhyJoin(e.target.value)}
                          rows={3}
                          placeholder="What motivates you to join Team1 Network?"
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>How can you help Team1? *</label>
                        <textarea
                          value={howHelp}
                          onChange={(e) => setHowHelp(e.target.value)}
                          rows={3}
                          placeholder="What skills, experience, or contributions can you bring?"
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>What are you expecting from us? *</label>
                        <textarea
                          value={expectations}
                          onChange={(e) => setExpectations(e.target.value)}
                          rows={3}
                          placeholder="What do you hope to gain from being a member?"
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Hours available weekly? *</label>
                        <input
                          type="number"
                          value={hoursWeekly}
                          onChange={(e) => setHoursWeekly(e.target.value)}
                          min={1}
                          max={168}
                          placeholder="e.g. 10"
                          className={`${inputClass} max-w-[140px]`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Additional Info ── */}
                  <div className={sectionClass}>
                    <h3 className={sectionTitleClass}>Additional Info</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>GitHub</label>
                        <input
                          type="text"
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          placeholder="https://github.com/username"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Referred By</label>
                        <input
                          type="text"
                          value={referredBy}
                          onChange={(e) => setReferredBy(e.target.value)}
                          placeholder="Name or handle"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Consent + Submit ── */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer mb-4">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#FF394A] focus:ring-[#FF394A] dark:border-zinc-700"
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        I confirm that the information provided is accurate. I understand this is a{' '}
                        <b className="text-zinc-700 dark:text-zinc-300">volunteer opportunity</b> and as a member,
                        I may earn bounties or grants for contributions.
                      </span>
                    </label>

                    <button
                      onClick={handleSubmit}
                      disabled={!isFormValid || submitting}
                      className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
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
