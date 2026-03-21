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

export const Route = createFileRoute('/api/attribute-groups')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const attributeKey = url.searchParams.get('attribute_key')
        const identifier = url.searchParams.get('identifier')
        const name = url.searchParams.get('name')
        const versionParam = url.searchParams.get('version')
        const attributesParam = url.searchParams.get('attributes')

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

        const version = versionParam ? parseInt(versionParam, 10) : undefined
        const invalidVersion =
          versionParam != null &&
          (version === undefined ||
            (typeof version === 'number' && (Number.isNaN(version) || version < 0)))
        if (invalidVersion) {
          return json(
            {
              error: 'Invalid version',
              message: 'version must be a non-negative integer',
              received: versionParam,
            },
            { status: 400 },
          )
        }

        const attributes = attributesParam
          ? attributesParam.split(',').map((a) => a.trim()).filter(Boolean)
          : []
        if (attributes.length === 0) {
          return json(
            {
              error: 'Missing or empty attributes',
              message: 'attributes query param is required (comma-separated list of attribute names)',
              received: attributesParam ?? null,
            },
            { status: 400 },
          )
        }

        if (version === undefined) {
          return json(
            {
              error: 'Missing version',
              message: 'version is required for attribute group requests',
              received: versionParam ?? null,
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
          const groupAttributes = await signalsResult.signals.getGroupAttributes({
            attribute_key: attributeKey,
            identifier,
            name,
            version,
            attributes: attributes as [string, ...string[]],
          })

          if (
            !groupAttributes ||
            (typeof groupAttributes === 'object' && Object.keys(groupAttributes).length === 0)
          ) {
            return json(
              {
                message: 'No attributes found for this attribute group',
                attributeKey,
                identifier,
                name,
                version,
                attributes: groupAttributes ?? {},
              },
              { status: 200 },
            )
          }

          return json(groupAttributes)
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          const stack = error instanceof Error ? error.stack : undefined

          return json(
            {
              error: 'Failed to fetch attribute group attributes',
              message,
              requestParams: { attributeKey, identifier, name, version, attributes },
              ...(process.env.NODE_ENV === 'development' && stack ? { stack } : {}),
            },
            { status: 500 },
          )
        }
      },
    },
  },
})
