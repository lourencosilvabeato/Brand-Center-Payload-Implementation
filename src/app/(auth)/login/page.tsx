import Image from 'next/image'
import { getPayload } from '@/lib/payload'
import type { Media, LoginSetting, FooterSetting } from '@/payload-types'
import { LoginForm } from '@/components/auth/LoginForm'
import { SocialIcon } from '@/components/ui/SocialIcon'
import styles from './login.module.css'

export const dynamic = 'force-dynamic'

type SocialLinkItem = NonNullable<FooterSetting['socialLinks']>[number]
type LegalLinkItem = NonNullable<FooterSetting['legalLinks']>[number]

async function getLoginData() {
  const payload = await getPayload()

  const [loginSettings, footerSettings] = await Promise.all([
    payload
      .findGlobal({ slug: 'loginSettings', depth: 1 })
      .catch(() => null) as Promise<LoginSetting | null>,
    payload
      .findGlobal({ slug: 'footerSettings', depth: 1 })
      .catch(() => null) as Promise<FooterSetting | null>,
  ])

  return { loginSettings, footerSettings }
}

function buildSsoUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID ?? '',
    redirect_uri: process.env.AZURE_REDIRECT_URI ?? '',
    response_type: 'code',
    scope: 'openid profile email',
  })
  return `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize?${params.toString()}`
}

export default async function LoginPage() {
  const { loginSettings, footerSettings } = await getLoginData()
  const ssoUrl = buildSsoUrl()

  const image = loginSettings?.image as Media | null | undefined
  const imageUrl = image?.url ?? null

  return (
    <div className={styles.page}>
      {/* ── Hero image ───────────────────────────────────────── */}
      <div className={styles.hero}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={image?.alt ?? 'Ascendum Brand Center'}
            fill
            className={styles.heroImg}
            priority
          />
        ) : (
          <div className={styles.heroFallback} />
        )}
      </div>

      {/* ── Main column (form + footer) ───────────────────────── */}
      <div className={styles.main}>
        <div className={styles.formWrapper}>
          {/* Optional editorial content above form */}
          {(loginSettings?.title || loginSettings?.introduction || loginSettings?.subtitle) && (
            <div className={styles.editorial}>
              {loginSettings.title && (
                <h1 className={styles.title}>{loginSettings.title}</h1>
              )}
              {loginSettings.introduction && (
                <p className={styles.introduction}>{loginSettings.introduction}</p>
              )}
              {loginSettings.subtitle && (
                <p className={styles.subtitle}>{loginSettings.subtitle}</p>
              )}
            </div>
          )}

          {/* Login form (client component) */}
          <LoginForm ssoUrl={ssoUrl} />

          {/* Institutional link */}
          {loginSettings?.institutionalLinkLabel && loginSettings.institutionalLinkUrl && (
            <a
              className={styles.institutionalLink}
              href={loginSettings.institutionalLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {loginSettings.institutionalLinkLabel}
            </a>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className={styles.footer}>
          <div className={styles.footerSeparator} />

          <div className={styles.footerInner}>
            {/* Brand name + social icons */}
            <div className={styles.socialRow}>
              {footerSettings?.brandName && (
                <span className={styles.brandName}>{footerSettings.brandName}</span>
              )}

              {footerSettings?.socialLinks && footerSettings.socialLinks.length > 0 && (
                <div className={styles.socialIcons}>
                  {footerSettings.socialLinks.map((item: SocialLinkItem, idx: number) => (
                    <a
                      key={idx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                    >
                      <SocialIcon platform={item.platform} />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Legal links */}
            {footerSettings?.legalLinks && footerSettings.legalLinks.length > 0 && (
              <div className={styles.legalRow}>
                {footerSettings.legalLinks.map((item: LegalLinkItem, idx: number) => {
                  const legalPage = item.page as { slug?: string } | null | undefined
                  const href = legalPage?.slug ? `/${legalPage.slug}` : (item.url ?? '#')
                  return (
                    <a
                      key={idx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.legalLink}
                    >
                      {item.label}
                    </a>
                  )
                })}
              </div>
            )}

            {/* Copyright */}
            {footerSettings?.copyright && (
              <p className={styles.copyright}>{footerSettings.copyright}</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
