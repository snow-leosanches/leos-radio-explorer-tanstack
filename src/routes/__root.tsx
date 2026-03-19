import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import ErrorBoundary from '../components/ErrorBoundary'
import Footer from '../components/Footer'
import Header from '../components/Header'
import AudioPlayer from '../components/player/AudioPlayer'
import { SnowplowProvider } from '../components/SnowplowProvider'
import { LibraryProvider } from '../context/LibraryContext'
import { PlayerProvider } from '../context/PlayerContext'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

const SW_REGISTER_SCRIPT = `if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){});})}`

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: "Leo's Radio Explorer" },
      { name: 'description', content: "Discover and stream thousands of live radio stations from every genre and corner of the world — free, no sign-up needed." },
      { name: 'theme-color', content: '#4fb8b2' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Radio Explorer' },
      { property: 'og:title', content: "Leo's Radio Explorer" },
      { property: 'og:description', content: 'Stream live radio from around the world.' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'apple-touch-icon', href: '/logo192.png' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script defer dangerouslySetInnerHTML={{ __html: SW_REGISTER_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <QueryClientProvider client={queryClient}>
          <LibraryProvider>
            <PlayerProvider>
              <SnowplowProvider />
              <Header />
              <ErrorBoundary>
                <div style={{ paddingBottom: 'var(--player-height)' }}>{children}</div>
              </ErrorBoundary>
              <Footer />
              <AudioPlayer />
              <Toaster
                position="bottom-center"
                offset={80}
                toastOptions={{
                  style: {
                    background: 'var(--surface-strong)',
                    color: 'var(--sea-ink)',
                    border: '1px solid var(--line)',
                  },
                }}
              />
              <TanStackDevtools
                config={{
                  position: 'bottom-right',
                }}
                plugins={[
                  {
                    name: 'Tanstack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                  },
                ]}
              />
              <Scripts />
            </PlayerProvider>
          </LibraryProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
