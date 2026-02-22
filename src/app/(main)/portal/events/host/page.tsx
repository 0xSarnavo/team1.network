'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/context/toast-context';
import { api } from '@/lib/api/client';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { Card, CardTitle } from '@/components/ui/card';

export default function HostEventPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', eventType: 'meetup', startDate: '', endDate: '',
    location: '', isVirtual: false, virtualUrl: '', maxAttendees: '',
    requirements: '', regionId: '',
  });

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    const res = await api.post('/api/portal/host-applications', {
      ...form,
      maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null,
    });
    if (res.success) {
      addToast('success', 'Host application submitted!');
      router.push('/portal/events');
    } else {
      addToast('error', res.error?.message || 'Failed');
    }
    setLoading(false);
  };

  const steps = ['Event Details', 'Schedule', 'Location', 'Review'];

  return (
    <AuthGuard>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold text-zinc-100">Host an Event</h1>
        <p className="mb-6 text-zinc-500">Step {step + 1} of {steps.length}</p>

        <div className="mb-8 flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-red-500' : 'bg-zinc-800'}`} />
              <p className={`mt-1 text-xs ${i <= step ? 'text-red-400' : 'text-zinc-600'}`}>{s}</p>
            </div>
          ))}
        </div>

        <Card>
          {step === 0 && (
            <div className="space-y-4">
              <CardTitle>Event Details</CardTitle>
              <Input label="Event Title" value={form.title} onChange={(e) => update('title', e.target.value)} required />
              <Textarea label="Description" value={form.description} onChange={(e) => update('description', e.target.value)} />
              <Select label="Event Type" value={form.eventType} onChange={(e) => update('eventType', e.target.value)} options={[
                { value: 'meetup', label: 'Meetup' }, { value: 'hackathon', label: 'Hackathon' },
                { value: 'workshop', label: 'Workshop' }, { value: 'conference', label: 'Conference' },
                { value: 'webinar', label: 'Webinar' },
              ]} />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <CardTitle>Schedule</CardTitle>
              <Input label="Start Date" type="datetime-local" value={form.startDate} onChange={(e) => update('startDate', e.target.value)} />
              <Input label="End Date" type="datetime-local" value={form.endDate} onChange={(e) => update('endDate', e.target.value)} />
              <Input label="Max Attendees" type="number" value={form.maxAttendees} onChange={(e) => update('maxAttendees', e.target.value)} placeholder="Leave empty for unlimited" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <CardTitle>Location</CardTitle>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={form.isVirtual} onChange={(e) => update('isVirtual', e.target.checked)} className="rounded" />
                Virtual Event
              </label>
              {form.isVirtual ? (
                <Input label="Virtual URL" value={form.virtualUrl} onChange={(e) => update('virtualUrl', e.target.value)} placeholder="https://..." />
              ) : (
                <Input label="Location" value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="Venue address" />
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <CardTitle>Review & Submit</CardTitle>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-300"><span className="text-zinc-500">Title:</span> {form.title}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Type:</span> {form.eventType}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Start:</span> {form.startDate || 'Not set'}</p>
                <p className="text-zinc-300"><span className="text-zinc-500">Location:</span> {form.isVirtual ? 'Virtual' : form.location || 'Not set'}</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : router.back()}>
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>Submit Application</Button>
            )}
          </div>
        </Card>
      </div>
    </AuthGuard>
  );
}
