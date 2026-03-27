import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { faker } from '@faker-js/faker'
import { useUser } from '../context/UserContext'
import { getStoredOnboardingData } from '../context/OnboardingContext'
import { knownUsers } from '../lib/known-users'
import { snowplowTracker, trackStructEvent } from '../lib/snowplow'
import { SIGNALS_QUERY_KEY_PREFIX } from '../hooks/usePersonalisedProfile'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Login · Leo's Radio Explorer" }] }),
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { redirect = '/' } = Route.useSearch()
  const { setUser, clearUser } = useUser()
  const [manualEmail, setManualEmail] = useState('')

  const resetSnowplowSession = () => {
    clearUser()
    snowplowTracker?.setUserId(null)
    // Clears first-party id/session storage and assigns a new domain user id (in-memory + next persisted cookie write).
    snowplowTracker?.clearUserData()
    // Drop cached Signals attribute-group responses so carousels do not reuse the previous domain_userid’s data.
    queryClient.removeQueries({ queryKey: [...SIGNALS_QUERY_KEY_PREFIX] })
    void navigate({ to: '/' })
  }

  const trackLogin = (id: string) => {
    snowplowTracker?.setUserId(id)
    trackStructEvent({ category: 'user', action: 'login', label: id })
  }

  /** After setting the user, go to onboarding if they haven't completed it, otherwise go to redirect. */
  const afterLogin = (userId: string) => {
    const hasOnboarding = !!getStoredOnboardingData(userId)
    if (!hasOnboarding) {
      void navigate({ to: '/onboarding', search: { redirect } })
    } else {
      void navigate({ to: redirect as '/' })
    }
  }

  const performAutoLogin = () => {
    const email = faker.internet.email()
    setUser({
      id: email,
      name: faker.person.fullName(),
      email,
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
    })
    trackLogin(email)
    afterLogin(email)
  }

  const performManualLogin = () => {
    const email = manualEmail.trim()
    if (!email) return
    setUser({ id: email, name: '', email, address: '', city: '', state: '', zipCode: '', country: '' })
    trackLogin(email)
    afterLogin(email)
  }

  return (
    <main className="page-wrap px-4 pt-10 pb-16">

      <h1 className="mb-8 text-3xl font-bold text-[var(--sea-ink)]">Login</h1>

      {/* Automatic Login */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-[var(--sea-ink)]">Automatic Login</h2>
        <p className="mb-4 text-sm text-[var(--sea-ink-soft)]">Who are you?</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="rounded-full border border-transparent bg-[var(--sea-ink)] px-6 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90"
            onClick={performAutoLogin}
          >
            Who, who, who, who?
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--line)] bg-transparent px-6 py-2.5 text-sm font-semibold text-[var(--sea-ink-soft)] transition hover:border-[var(--lagoon-deep)] hover:text-[var(--sea-ink)]"
            onClick={resetSnowplowSession}
          >
            Reset Snowplow session
          </button>
        </div>
        <p className="mt-2 text-xs text-[var(--sea-ink-soft)]">
          Reset assigns a new Snowplow domain user id, clears cached Signals attributes, and returns you to the home page.
        </p>
      </section>

      {/* Manual Login */}
      <section className="mb-8">
        <h2 className="mb-3 text-xl font-semibold text-[var(--sea-ink)]">Manual Login</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="manual-login-email" className="text-sm font-medium text-[var(--sea-ink)]">
              Email
            </label>
            <input
              id="manual-login-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && performManualLogin()}
              className="rounded-xl border border-[var(--line)] bg-transparent px-4 py-2.5 text-sm text-[var(--sea-ink)] placeholder-[var(--sea-ink-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--lagoon-deep)]"
            />
          </div>
          <button
            type="button"
            className="self-start rounded-full border border-transparent bg-[var(--sea-ink)] px-6 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90"
            onClick={performManualLogin}
          >
            Manual Login
          </button>
        </div>
      </section>

      {/* Known User Login */}
      <section>
        <h2 className="mb-3 text-xl font-semibold text-[var(--sea-ink)]">Known User Login</h2>
        <div className="flex flex-col gap-3">
          {knownUsers.map((u) => (
            <button
              key={u.id}
              type="button"
              className="rounded-full border border-transparent bg-[var(--sea-ink)] px-6 py-2.5 text-sm font-semibold text-[var(--bg-base)] transition hover:opacity-90"
              onClick={() => {
                setUser(u)
                trackLogin(u.id)
                afterLogin(u.id)
              }}
            >
              {u.name} ({u.email})
            </button>
          ))}
        </div>
      </section>

    </main>
  )
}
