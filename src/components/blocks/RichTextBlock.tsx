import { RichText } from '@payloadcms/richtext-lexical/react'
import type { ContentPage } from '@/payload-types'
import styles from './RichText.module.css'

type Block = Extract<NonNullable<ContentPage['layout']>[number], { blockType: 'richText' }>

export function RichTextBlock({ block }: { block: Block }) {
  return <RichText data={block.content} className={styles.richText} />
}
