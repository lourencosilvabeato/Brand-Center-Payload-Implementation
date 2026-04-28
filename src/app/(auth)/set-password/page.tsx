import { redirect } from 'next/navigation'
import crypto from 'crypto'
import { getPayload } from '@/lib/payload'
import type { LoginSetting, FooterSetting, Media } from '@/payload-types'
import { SetPasswordForm } from '@/components/auth/SetPasswordForm'
import Image from 'next/image'
import styles from './set-password.module.css'

export const dynamic = 'force-dynamic'

type SocialLinkItem = NonNullable<FooterSetting['socialLinks']>[number]
type LegalLinkItem = NonNullable<FooterSetting['legalLinks']>[number]

interface Props {
  searchParams: Promise<{ token?: string; type?: string }>
}

export default async function SetPasswordPage({ searchParams }: Props) {
  const { token, type } = await searchParams

  if (!token) redirect('/expired-link')

  const payload = await getPayload()
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const now = new Date().toISOString()

  const isReset = type === 'reset'

  if (isReset) {
    const resets = await payload.find({
      collection: 'passwordResets',
      where: {
        and: [
          { tokenHash: { equals: tokenHash } },
          { used: { equals: false } },
          { expiresAt: { greater_than: now } },
        ],
      },
      limit: 1,
      depth: 0,
    })
    if (resets.totalDocs === 0) redirect('/expired-link')
  } else {
    const invitations = await payload.find({
      collection: 'invitations',
      where: {
        and: [
          { tokenHash: { equals: tokenHash } },
          { used: { equals: false } },
          { cancelled: { equals: false } },
          { expiresAt: { greater_than: now } },
        ],
      },
      limit: 1,
    })
    if (invitations.totalDocs === 0) redirect('/expired-link')
  }

  const [loginSettings, footerSettings] = await Promise.all([
    payload
      .findGlobal({ slug: 'loginSettings', depth: 1 })
      .catch(() => null) as Promise<LoginSetting | null>,
    payload
      .findGlobal({ slug: 'footerSettings', depth: 1 })
      .catch(() => null) as Promise<FooterSetting | null>,
  ])

  const image = loginSettings?.image as Media | null | undefined
  const imageUrl = image?.url ?? null

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        {imageUrl ? (
          <img src={imageUrl} alt={image?.alt ?? ''} className={styles.heroImg} />
        ) : (
          <div className={styles.heroFallback} />
        )}
      </div>

      <div className={styles.main}>
        <div className={styles.formWrapper}>
          {(loginSettings?.title || loginSettings?.introduction) && (
            <div className={styles.editorial}>
              {loginSettings.title && (
                <h1 className={styles.title}>{loginSettings.title}</h1>
              )}
              {loginSettings.introduction && (
                <p className={styles.introduction}>{loginSettings.introduction}</p>
              )}
            </div>
          )}

          <SetPasswordForm
            token={token}
            confirmUrl={isReset ? '/api/reset-password/confirm' : '/api/set-password'}
          />
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerSeparator} />
          <div className={styles.footerInner}>
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
                      {(() => {
                        const icon = item.icon as Media
                        return icon?.url ? (
                          <Image src={icon.url} alt={icon.alt ?? ''} width={32} height={32} style={{ objectFit: 'contain' }} />
                        ) : null
                      })()}
                    </a>
                  ))}
                </div>
              )}
            </div>
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
            {footerSettings?.copyright && (
              <p className={styles.copyright}>{footerSettings.copyright}</p>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
