import type { ContentPage } from '@/payload-types'
import { RichTextBlock } from './blocks/RichTextBlock'
import { ImageBlock } from './blocks/ImageBlock'
import { QuoteBlock } from './blocks/QuoteBlock'
import { NoteBlock } from './blocks/NoteBlock'
import { TableBlock } from './blocks/TableBlock'
import { GridBlock } from './blocks/GridBlock'
import { CollectionCardBlock } from './blocks/CollectionCardBlock'
import { DownloadBlock } from './blocks/DownloadBlock'
import { DividerBlock } from './blocks/DividerBlock'
import { FaqBlock } from './blocks/FaqBlock'
import { SectionBlock } from './blocks/SectionBlock'
import { IconLibraryBlock } from './blocks/IconLibraryBlock'

type Block = NonNullable<ContentPage['layout']>[number]

interface Props {
  blocks: Block[]
}

export function BlockRenderer({ blocks }: Props) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = block.id ?? i
        switch (block.blockType) {
          case 'richText':
            return <RichTextBlock key={key} block={block} />
          case 'imageBlock':
            return <ImageBlock key={key} block={block} />
          case 'quoteBlock':
            return <QuoteBlock key={key} block={block} />
          case 'noteBlock':
            return <NoteBlock key={key} block={block} />
          case 'tableBlock':
            return <TableBlock key={key} block={block} />
          case 'gridBlock':
            return <GridBlock key={key} block={block} />
          case 'collectionCardBlock':
            return <CollectionCardBlock key={key} block={block} />
          case 'downloadBlock':
            return <DownloadBlock key={key} block={block} />
          case 'dividerBlock':
            return <DividerBlock key={key} block={block} />
          case 'faqBlock':
            return <FaqBlock key={key} block={block} />
          case 'sectionBlock':
            return <SectionBlock key={key} block={block} />
          case 'iconLibraryBlock':
            return <IconLibraryBlock key={key} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
