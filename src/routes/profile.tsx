import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '../context/UserContext'
import { useOnboarding } from '../context/OnboardingContext'
import { TOPIC_GROUPS, MIN_INTERESTS } from '../lib/onboarding-topics'
import { snowplowTracker, trackStructEvent } from '../lib/snowplow'
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed'
import { usePersonalisedProfile } from '../hooks/usePersonalisedProfile'
import StationCard from '../components/ui/StationCard'
import { flagEmoji, getGenreMeta } from '../lib/genre-meta'
import { getCountries } from '../lib/radio-browser'
import { queryKeys } from '../lib/query-keys'

export const Route = createFileRoute('/profile')({
  head: () => ({ meta: [{ title: "Profile · Leo's Radio Explorer" }] }),
  component: ProfilePage,
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  dateOfBirth: string
  onboardingZip: string
  interests: Set<string>
}

interface FormErrors {
  email?: string
  dateOfBirth?: string
  onboardingZip?: string
  interests?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initForm(
  user: ReturnType<typeof useUser>['user'],
  onboarding: ReturnType<typeof useOnboarding>['onboardingData'],
): FormState {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    state: user?.state ?? '',
    zipCode: user?.zipCode ?? '',
    country: user?.country ?? '',
    dateOfBirth: onboarding?.dateOfBirth ?? '',
    onboardingZip: onboarding?.zipCode ?? '',
    interests: new Set(onboarding?.interests ?? []),
  }
}

function validate(form: FormState, hasOnboarding: boolean): FormErrors {
  const errors: FormErrors = {}
  if (!form.email.trim()) errors.email = 'Email is required.'
  if (hasOnboarding) {
    if (form.dateOfBirth) {
      const d = new Date(form.dateOfBirth)
      if (isNaN(d.getTime()) || d >= new Date()) errors.dateOfBirth = 'Enter a valid past date.'
    }
    if (form.onboardingZip && !/^\d{5}(-\d{4})?$/.test(form.onboardingZip.trim())) {
      errors.onboardingZip = 'Enter a valid 5-digit US ZIP code.'
    }
    if (form.interests.size < MIN_INTERESTS) {
      errors.interests = `Select at least ${MIN_INTERESTS} interests.`
    }
  }
  return errors
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="mb-0.5 text-xs font-semibold text-[var(--sea-ink-soft)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--sea-ink)]">{value}</dd>
    </div>
  )
}

function TextInput({
  label, id, value, onChange, type = 'text', error, placeholder,
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  type?: string
  error?: string
  placeholder?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-[var(--sea-ink-soft)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        max={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
        className="rounded-xl border border-[var(--line)] bg-transparent px-3 py-2 text-sm text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon-deep)]"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ProfilePage() {
  const { user, setUser, clearUser } = useUser()
  const { onboardingData, saveOnboarding, clearOnboarding } = useOnboarding()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<FormState>(() => initForm(user, onboardingData))
  const [errors, setErrors] = useState<FormErrors>({})

  if (!user) {
    return (
      <main className="page-wrap px-4 py-16 text-center">
        <p className="mb-4 text-[var(--sea-ink-soft)]">You're not logged in.</p>
        <Link
          to="/login"
          className="rounded-full bg-[var(--sea-ink)] px-6 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90"
        >
          Go to Login
        </Link>
      </main>
    )
  }

  const set = (key: keyof Omit<FormState, 'interests'>) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }))

  const toggleInterest = (id: string) =>
    setForm((f) => {
      const next = new Set(f.interests)
      next.has(id) ? next.delete(id) : next.add(id)
      return { ...f, interests: next }
    })

  const handleEdit = () => {
    setForm(initForm(user, onboardingData))
    setErrors({})
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setErrors({})
  }

  const handleSave = () => {
    const errs = validate(form, !!onboardingData)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setUser({
      ...user,
      name: form.name,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      zipCode: form.zipCode,
      country: form.country,
    })

    if (onboardingData) {
      saveOnboarding({
        dateOfBirth: form.dateOfBirth,
        zipCode: form.onboardingZip,
        interests: [...form.interests],
      })
    }

    trackStructEvent({ category: 'user', action: 'profile_updated' })
    setEditing(false)
  }

  const handleLogout = () => {
    clearUser()
    clearOnboarding()
    snowplowTracker?.setUserId(null)
    void navigate({ to: '/' })
  }

  const formattedDOB = onboardingData?.dateOfBirth
    ? new Date(onboardingData.dateOfBirth + 'T00:00:00').toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : null

  const selectedByGroup = onboardingData
    ? TOPIC_GROUPS.map((g) => ({
        label: g.label,
        selected: g.topics.filter((t) => onboardingData.interests.includes(t.id)),
      })).filter((g) => g.selected.length > 0)
    : []

  return (
    <main className="page-wrap px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Header row */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--kicker)]">
              Profile
            </p>
            <h1 className="display-title text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
              {user.name || user.email}
            </h1>
          </div>
          <div className="flex shrink-0 gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-full bg-[var(--sea-ink)] px-5 py-2 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[var(--line)] px-5 py-2 text-sm font-semibold text-[var(--sea-ink-soft)] transition hover:border-red-400 hover:text-red-500"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </div>

        {/* Identity */}
        <section className="island-shell mb-10 rounded-2xl p-6">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
            Identity
          </h2>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput label="Name" id="name" value={form.name} onChange={set('name')} placeholder="Your name" />
              <TextInput label="Email" id="email" value={form.email} onChange={set('email')} type="email" error={errors.email} placeholder="you@example.com" />
              <TextInput label="Address" id="address" value={form.address} onChange={set('address')} placeholder="123 Main St" />
              <TextInput label="City" id="city" value={form.city} onChange={set('city')} placeholder="City" />
              <TextInput label="State" id="state" value={form.state} onChange={set('state')} placeholder="State" />
              <TextInput label="ZIP" id="zipCode" value={form.zipCode} onChange={set('zipCode')} placeholder="12345" />
              <TextInput label="Country" id="country" value={form.country} onChange={set('country')} placeholder="Country" />
            </div>
          ) : (
            <dl className="grid gap-3 sm:grid-cols-2">
              {user.name && <Field label="Name" value={user.name} />}
              <Field label="Email" value={user.email} />
              {user.address && <Field label="Address" value={user.address} />}
              {user.city && <Field label="City" value={user.city} />}
              {user.state && <Field label="State" value={user.state} />}
              {user.zipCode && <Field label="ZIP" value={user.zipCode} />}
              {user.country && <Field label="Country" value={user.country} />}
            </dl>
          )}
        </section>

        {/* Personal details + interests */}
        {onboardingData ? (
          <>
            <section className="island-shell mb-10 rounded-2xl p-6">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
                Personal details
              </h2>
              {editing ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextInput label="Date of birth" id="dob" type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} error={errors.dateOfBirth} />
                  <TextInput label="ZIP code" id="onboardingZip" value={form.onboardingZip} onChange={set('onboardingZip')} placeholder="12345" error={errors.onboardingZip} />
                </div>
              ) : (
                <dl className="grid gap-3 sm:grid-cols-2">
                  {formattedDOB && <Field label="Date of birth" value={formattedDOB} />}
                  <Field label="ZIP code" value={onboardingData.zipCode} />
                </dl>
              )}
            </section>

            <section className="island-shell mb-10 rounded-2xl p-6">
              <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
                Interests
              </h2>
              {editing ? (
                <>
                  <div className="mb-4 flex items-center gap-2">
                    <span className={`text-sm font-semibold ${form.interests.size >= MIN_INTERESTS ? 'text-[var(--sea-ink)]' : 'text-[var(--sea-ink-soft)]'}`}>
                      {form.interests.size} selected
                    </span>
                    {errors.interests && (
                      <span className="text-xs text-red-500">{errors.interests}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-8">
                    {TOPIC_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="mb-4 mt-1 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
                          {group.label}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.topics.map((topic) => {
                            const active = form.interests.has(topic.id)
                            return (
                              <button
                                key={topic.id}
                                type="button"
                                onClick={() => toggleInterest(topic.id)}
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
                </>
              ) : (
                <div className="mt-4 flex flex-col gap-6">
                  {selectedByGroup.map((group) => (
                    <div key={group.label}>
                      <p className="mb-3 text-xs font-semibold text-[var(--sea-ink-soft)]">
                        {group.label}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.selected.map((topic) => (
                          <span
                            key={topic.id}
                            className="rounded-full border border-teal-800 bg-teal-800 px-4 py-1.5 text-sm font-semibold text-white"
                          >
                            {topic.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="island-shell mb-10 rounded-2xl p-6 text-center">
            <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">
              You haven't completed onboarding yet.
            </p>
            <Link
              to="/onboarding"
              className="rounded-full bg-[var(--sea-ink)] px-6 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90"
            >
              Complete onboarding
            </Link>
          </div>
        )}

        <RadioHistorySection />
        <SignalsAttributesSection />

      </div>
    </main>
  )
}

// ─── Radio History ────────────────────────────────────────────────────────────

function RadioHistorySection() {
  const recent = useRecentlyPlayed()

  return (
    <section className="island-shell mb-10 rounded-2xl p-6">
      <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
        Listening History
      </h2>
      {recent.length === 0 ? (
        <p className="text-sm text-[var(--sea-ink-soft)]">No stations played yet. Start exploring!</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--line)]">
          {recent.map((station) => (
            <StationCard key={station.stationuuid} station={station} variant="row" />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Signals Attributes ───────────────────────────────────────────────────────

function SignalsAttributesSection() {
  const { attributes, isLoading } = usePersonalisedProfile()
  const { data: countries } = useQuery({
    queryKey: queryKeys.countries.all(),
    queryFn: () => getCountries(),
  })

  const countryName = (code: string) =>
    countries?.find((c) => c.iso_3166_1.toUpperCase() === code.toUpperCase())?.name ?? code

  if (isLoading) {
    return (
      <section className="island-shell mb-10 rounded-2xl p-6">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
          Listening Profile
        </h2>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton-pulse h-4 w-2/3 rounded" />
          ))}
        </div>
      </section>
    )
  }

  if (!attributes) return null

  const sortedCountries = Object.entries(attributes.countries_count ?? {}).sort(([, a], [, b]) => b - a)
  const sortedGenres = Object.entries(attributes.genres_count ?? {}).sort(([, a], [, b]) => b - a)
  const hasLastSession =
    attributes.last_country_visited ||
    attributes.last_genre_visited ||
    attributes.last_region_name ||
    attributes.last_zip_code

  if (sortedCountries.length === 0 && sortedGenres.length === 0 && !hasLastSession) return null

  return (
    <section className="island-shell mb-10 rounded-2xl p-6">
      <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[var(--sea-ink-soft)]">
        Listening Profile
      </h2>
      <dl className="flex flex-col gap-6">
        {sortedCountries.length > 0 && (
          <div>
            <dt className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)]">Countries explored</dt>
            <dd className="flex flex-wrap gap-2">
              {sortedCountries.map(([code, count]) => (
                <span
                  key={code}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1 text-sm font-medium text-[var(--sea-ink)]"
                >
                  {flagEmoji(code)} {countryName(code)}
                  <span className="text-xs text-[var(--sea-ink-soft)]">· {count}</span>
                </span>
              ))}
            </dd>
          </div>
        )}
        {sortedGenres.length > 0 && (
          <div>
            <dt className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)]">Genres explored</dt>
            <dd className="flex flex-wrap gap-2">
              {sortedGenres.map(([genre, count]) => {
                const meta = getGenreMeta(genre)
                const label = genre.charAt(0).toUpperCase() + genre.slice(1)
                return (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1 text-sm font-medium text-[var(--sea-ink)]"
                  >
                    {meta.emoji} {label}
                    <span className="text-xs text-[var(--sea-ink-soft)]">· {count}</span>
                  </span>
                )
              })}
            </dd>
          </div>
        )}
        {hasLastSession && (
          <div>
            <dt className="mb-3 text-xs font-semibold text-[var(--sea-ink-soft)]">Last session</dt>
            <dd className="grid gap-3 sm:grid-cols-2">
              {attributes.last_country_visited && (
                <Field
                  label="Country"
                  value={`${flagEmoji(attributes.last_country_visited)} ${countryName(attributes.last_country_visited)}`}
                />
              )}
              {attributes.last_genre_visited && (
                <Field
                  label="Genre"
                  value={`${getGenreMeta(attributes.last_genre_visited).emoji} ${attributes.last_genre_visited.charAt(0).toUpperCase() + attributes.last_genre_visited.slice(1)}`}
                />
              )}
              {attributes.last_region_name && <Field label="Region" value={attributes.last_region_name} />}
              {attributes.last_zip_code && <Field label="ZIP code" value={attributes.last_zip_code} />}
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
