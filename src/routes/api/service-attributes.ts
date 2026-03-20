import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import { Signals } from '@snowplow/signals-node'

type SignalsInitResult =
  | { success: true; signals: Signals }
  | { success: false; error: string; details: Record<string, boolean> }

function getSignalsInstance(): SignalsInitResult {
  const baseUrl =
    process.env.SNOWPLOW_SIGNALS_ENDPOINT ?? process.env.VITE_SNOWPLOW_SIGNALS_ENDPOINT
  const apiKey =
    process.env.SNOWPLOW_SIGNALS_API_KEY ?? process.env.VITE_SNOWPLOW_SIGNALS_API_KEY
  const apiKeyId =
    process.env.SNOWPLOW_SIGNALS_API_KEY_ID ?? process.env.VITE_SNOWPLOW_SIGNALS_API_KEY_ID
  const organizationId =
    process.env.SNOWPLOW_SIGNALS_ORG_ID ?? process.env.VITE_SNOWPLOW_SIGNALS_ORG_ID
  const sandboxToken =
    process.env.SNOWPLOW_SIGNALS_SANDBOX_TOKEN ??
    process.env.VITE_SNOWPLOW_SIGNALS_SANDBOX_TOKEN

  if (!baseUrl) {
    return {
      success: false,
      error: 'Missing SNOWPLOW_SIGNALS_ENDPOINT environment variable',
      details: {
        hasBaseUrl: false,
        hasApiKey: !!apiKey,
        hasApiKeyId: !!apiKeyId,
        hasOrgId: !!organizationId,
        hasSandboxToken: !!sandboxToken,
      },
    }
  }

  try {
    if (sandboxToken) {
      return {
        success: true,
        signals: new Signals({ baseUrl, sandboxToken }),
      }
    }

    if (!apiKey || !apiKeyId || !organizationId) {
      return {
        success: false,
        error: 'Missing required parameters for API key mode',
        details: {
          hasBaseUrl: !!baseUrl,
          hasApiKey: !!apiKey,
          hasApiKeyId: !!apiKeyId,
          hasOrgId: !!organizationId,
          hasSandboxToken: !!sandboxToken,
        },
      }
    }

    return {
      success: true,
      signals: new Signals({ baseUrl, apiKey, apiKeyId, organizationId }),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return {
      success: false,
      error: `Failed to initialize Snowplow Signals: ${message}`,
      details: {
        hasBaseUrl: !!baseUrl,
        hasApiKey: !!apiKey,
        hasApiKeyId: !!apiKeyId,
        hasOrgId: !!organizationId,
        hasSandboxToken: !!sandboxToken,
      },
    }
  }
}

export const Route = createFileRoute('/api/service-attributes')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const attributeKey = url.searchParams.get('attribute_key')
        const identifier = url.searchParams.get('identifier')
        const name = url.searchParams.get('name')

        if (!attributeKey || !identifier || !name) {
          return json(
            {
              error: 'Missing required parameters',
              message: 'attribute_key, identifier, and name are required',
              received: {
                attributeKey: attributeKey ?? null,
                identifier: identifier ?? null,
                name: name ?? null,
              },
            },
            { status: 400 },
          )
        }

        const signalsResult = getSignalsInstance()
        if (!signalsResult.success) {
          return json(
            {
              error: 'Snowplow Signals not configured on server',
              message: signalsResult.error,
              diagnostic: signalsResult.details,
            },
            { status: 500 },
          )
        }

        try {
          const attributes = await signalsResult.signals.getServiceAttributes({
            attribute_key: attributeKey,
            identifier,
            name,
          })

          if (
            !attributes ||
            (typeof attributes === 'object' && Object.keys(attributes).length === 0)
          ) {
            return json(
              { message: 'No attributes found', attributeKey, identifier, name, attributes: attributes ?? {} },
              { status: 200 },
            )
          }

          return json(attributes)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          const stack = error instanceof Error ? error.stack : undefined

          return json(
            {
              error: 'Failed to fetch service attributes',
              message,
              requestParams: { attributeKey, identifier, name },
              ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
