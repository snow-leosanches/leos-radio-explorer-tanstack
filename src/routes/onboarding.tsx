import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useOnboarding } from '../context/OnboardingContext'
import { TOPIC_GROUPS, MIN_INTERESTS } from '../lib/onboarding-topics'
import { trackStructEvent } from '../lib/snowplow'

export const Route = createFileRoute('/onboarding')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Welcome · Leo's Radio Explorer" }] }),
  component: OnboardingPage,
})

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateDOB(value: string): string | null {
  if (!value) return 'Date of birth is required.'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Enter a valid date.'
  const now = new Date()
  if (date >= now) return 'Date of birth must be in the past.'
  const minAge = new Date(now.getFullYear() - 120, now.getMonth(), now.getDate())
  if (date < minAge) return 'Enter a realistic date of birth.'
  return null
}

function validateZip(value: string): string | null {
  if (!value.trim()) return 'ZIP code is required.'
  if (!/^\d{5}(-\d{4})?$/.test(value.trim())) return 'Enter a valid 5-digit US ZIP code.'
  return null
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────

function StepPersonal({
  initialDOB,
  initialZip,
  onNext,
}: {
  initialDOB: string
  initialZip: string
  onNext: (dob: string, zip: string) => void
}) {
  const [dob, setDob] = useState(initialDOB)
  const [zip, setZip] = useState(initialZip)
  const [errors, setErrors] = useState<{ dob?: string; zip?: string }>({})

  const handleSubmit = () => {
    const dobErr = validateDOB(dob)
    const zipErr = validateZip(zip)
    if (dobErr || zipErr) {
      setErrors({ dob: dobErr ?? undefined, zip: zipErr ?? undefined })
      return
    }
    onNext(dob, zip)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-2xl font-bold text-[var(--sea-ink)]">Tell us about yourself</h2>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Just a couple of quick details to personalise your experience.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Date of birth */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dob" className="text-sm font-semibold text-[var(--sea-ink)]">
            Date of birth
          </label>
          <input
            id="dob"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={dob}
            onChange={(e) => { setDob(e.target.value); setErrors((p) => ({ ...p, dob: undefined })) }}
            className="rounded-xl border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm text-[var(--sea-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon-deep)]"
          />
          {errors.dob && <p className="text-xs text-red-500">{errors.dob}</p>}
        </div>

        {/* ZIP code */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="zip" className="text-sm font-semibold text-[var(--sea-ink)]">
            ZIP code
          </label>
          <input
            id="zip"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 90210"
            maxLength={10}
            value={zip}
            onChange={(e) => { setZip(e.target.value); setErrors((p) => ({ ...p, zip: undefined })) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="rounded-xl border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon-deep)]"
          />
          {errors.zip && <p className="text-xs text-red-500">{errors.zip}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded-full bg-[var(--sea-ink)] px-8 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────

function StepInterests({
  initialInterests,
  onBack,
  onFinish,
}: {
  initialInterests: string[]
  onBack: () => void
  onFinish: (interests: string[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialInterests))
  const [touched, setTouched] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const handleFinish = () => {
    setTouched(true)
    if (selected.size < MIN_INTERESTS) return
    onFinish([...selected])
  }

  const remaining = Math.max(0, MIN_INTERESTS - selected.size)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-1 text-2xl font-bold text-[var(--sea-ink)]">Pick your interests</h2>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          Choose at least {MIN_INTERESTS} topics — we'll use these to personalise your feed.
        </p>
      </div>

      {/* Counter */}
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-semibold transition-colors ${selected.size >= MIN_INTERESTS ? 'text-[var(--sea-ink)]' : 'text-[var(--sea-ink-soft)]'}`}
        >
          {selected.size} selected
        </span>
        {remaining > 0 && (
          <span className="text-xs text-[var(--sea-ink-soft)]">
            — pick {remaining} more to continue
          </span>
        )}
        {touched && remaining > 0 && (
          <span className="text-xs text-red-500 font-medium">
            Please select at least {MIN_INTERESTS}.
          </span>
        )}
      </div>

      {/* Topic groups */}
      <div className="flex flex-col gap-10">
        {TOPIC_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-4 mt-1 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
              {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.topics.map((topic) => {
                const active = selected.has(topic.id)
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggle(topic.id)}
                    className={[
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition-all',
                      active
                        ? 'border-teal-800 bg-teal-800 font-semibold text-white shadow-md ring-2 ring-teal-800 ring-offset-2 ring-offset-[var(--surface-strong)]'
                        : 'border-[var(--line)] bg-transparent text-[var(--sea-ink-soft)] hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]',
                    ].join(' ')}
                  >
                    {topic.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-[var(--line)] px-6 py-2.5 text-sm font-semibold text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleFinish}
          className="rounded-full bg-[var(--sea-ink)] px-8 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90 disabled:opacity-40"
          disabled={selected.size < MIN_INTERESTS}
        >
          Finish
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function OnboardingPage() {
  const navigate = useNavigate()
  const { redirect = '/' } = Route.useSearch()
  const { saveOnboarding } = useOnboarding()

  const [step, setStep] = useState<1 | 2>(1)
  const [dob, setDob] = useState('')
  const [zip, setZip] = useState('')

  const handleStep1 = (nextDob: string, nextZip: string) => {
    setDob(nextDob)
    setZip(nextZip)
    setStep(2)
  }

  const handleFinish = (interests: string[]) => {
    saveOnboarding({ dateOfBirth: dob, zipCode: zip, interests })
    trackStructEvent({ category: 'onboarding', action: 'completed', value: interests.length })
    void navigate({ to: redirect as '/' })
  }

  return (
    <main className="page-wrap px-4 py-10">
      <div className="mx-auto max-w-xl">

        {/* Progress bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--sea-ink-soft)]">
            <span>Step {step} of 2</span>
            <span>{step === 1 ? 'Personal details' : 'Interests'}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
            <div
              className="h-full rounded-full bg-[var(--sea-ink)] transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="island-shell rounded-2xl p-6 sm:p-8">
          {step === 1 ? (
            <StepPersonal initialDOB={dob} initialZip={zip} onNext={handleStep1} />
          ) : (
            <StepInterests
              initialInterests={[]}
              onBack={() => setStep(1)}
              onFinish={handleFinish}
            />
          )}
        </div>

      </div>
    </main>
  )
}
