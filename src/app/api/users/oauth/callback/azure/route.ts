import { NextResponse } from 'next/server'
import { createHash, createHmac } from 'crypto'
import { getPayload } from '@/lib/payload'

// Must match getSigningKey() in lib/auth.ts exactly
function getSigningKey(): string {
  return createHash('sha256')
    .update(process.env.PAYLOAD_SECRET ?? '')
    .digest('hex')
    .slice(0, 32)
}

function b64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generatePayloadJWT(claims: Record<string, unknown>): string {
  const header = b64urlEncode(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })))
  const payload = b64urlEncode(Buffer.from(JSON.stringify(claims)))
  const key = getSigningKey()
  const sig = b64urlEncode(
    createHmac('sha256', Buffer.from(key, 'utf8'))
      .update(`${header}.${payload}`)
      .digest(),
  )
  return `${header}.${payload}.${sig}`
}

const TOKEN_EXPIRY_SECONDS = 7200 // 2 hours — matches Payload default

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (error || !code) {
    const desc = url.searchParams.get('error_description') ?? 'no code returned'
    console.error(`[azure-oauth] Auth error from Azure: ${error ?? 'none'} — ${desc}`)
    return NextResponse.redirect(new URL('/login?error=sso_failed', baseUrl))
  }

  // Exchange authorisation code for tokens
  let azureId: string
  let email: string
  let displayName: string

  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.AZURE_CLIENT_ID ?? '',
          client_secret: process.env.AZURE_CLIENT_SECRET ?? '',
          code,
          redirect_uri: process.env.AZURE_REDIRECT_URI ?? '',
          grant_type: 'authorization_code',
        }),
      },
    )

    if (!tokenRes.ok) {
      console.error('[azure-oauth] Token exchange failed:', tokenRes.status, await tokenRes.text())
      return NextResponse.redirect(new URL('/login?error=sso_failed', baseUrl))
    }

    const tokenData = (await tokenRes.json()) as {
      access_token?: string
      id_token?: string
    }

    if (!tokenData.id_token) {
      console.error('[azure-oauth] No id_token in token response')
      return NextResponse.redirect(new URL('/login?error=sso_failed', baseUrl))
    }

    // Decode the id_token payload — no Graph API call needed
    // The id_token contains oid (azureId), name, email/preferred_username
    const idPayload = tokenData.id_token.split('.')[1]
    if (!idPayload) {
      console.error('[azure-oauth] Malformed id_token')
      return NextResponse.redirect(new URL('/login?error=sso_failed', baseUrl))
    }

    const claims = JSON.parse(
      Buffer.from(idPayload, 'base64url').toString('utf8'),
    ) as {
      oid?: string
      name?: string
      email?: string
      preferred_username?: string
    }

    azureId = claims.oid ?? ''
    email = (claims.email ?? claims.preferred_username ?? '').toLowerCase()
    displayName = claims.name ?? email

    if (!azureId || !email) {
      console.error('[azure-oauth] Missing oid or email in id_token claims:', JSON.stringify(claims))
      return NextResponse.redirect(new URL('/login?error=sso_failed', baseUrl))
    }
  } catch (err) {
    console.error('[azure-oauth] Token exchange threw:', err)
    return NextResponse.redirect(new URL('/login?error=sso_failed', baseUrl))
  }

  // Find or create the platform user
  const payload = await getPayload()
  let platformUser: { id: string | number; email: string; role: string }

  try {
    // 1. Returning user — look up by azureId
    const byAzureId = await payload.find({
      collection: 'platformUsers',
      where: { azureId: { equals: azureId } },
      limit: 1,
    })

    if (byAzureId.totalDocs > 0) {
      const existing = byAzureId.docs[0]!
      await payload.update({
        collection: 'platformUsers',
        id: existing.id,
        data: { displayName },
      })
      platformUser = {
        id: existing.id,
        email: String(existing.email ?? email),
        role: String(existing.role),
      }
    } else {
      // 2. Pre-created user (admin assigned a role before first login) — look up by email
      const byEmail = await payload.find({
        collection: 'platformUsers',
        where: { email: { equals: email } },
        limit: 1,
      })

      if (byEmail.totalDocs > 0) {
        const existing = byEmail.docs[0]!
        await payload.update({
          collection: 'platformUsers',
          id: existing.id,
          data: { azureId, displayName },
        })
        platformUser = {
          id: existing.id,
          email: String(existing.email ?? email),
          role: String(existing.role),
        }
      } else {
        // 3. First ever login — auto-create with internal role per Confluence A01 spec
        const created = await payload.create({
          collection: 'platformUsers',
          data: {
            email,
            azureId,
            displayName,
            role: 'internal',
            // Unguessable password — SSO users never use the email+password path
            password: createHash('sha256')
              .update(azureId + (process.env.PAYLOAD_SECRET ?? ''))
              .digest('hex'),
          },
        })
        platformUser = {
          id: created.id,
          email: String(created.email ?? email),
          role: String(created.role),
        }
        console.log(`[azure-oauth] Created new internal user: ${email}`)
      }
    }
  } catch (err) {
    console.error('[azure-oauth] DB error:', err)
    return NextResponse.redirect(new URL('/login?error=sso_failed', baseUrl))
  }

  // Issue a Payload-compatible HS256 JWT and set it as the session cookie
  const exp = Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS
  const token = generatePayloadJWT({
    id: platformUser.id,
    email: platformUser.email,
    collection: 'platformUsers',
    role: platformUser.role,
    exp,
  })

  const response = NextResponse.redirect(new URL('/', baseUrl))
  response.cookies.set('payload-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: TOKEN_EXPIRY_SECONDS,
    path: '/',
  })

  return response
}
