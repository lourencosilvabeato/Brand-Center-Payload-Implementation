import type { ContentPage } from '@/payload-types'
import { RichTextBlock } from './blocks/RichTextBlock'
import { QuoteBlock } from './blocks/QuoteBlock'
import { NoteBlock } from './blocks/NoteBlock'
import { TableBlock } from './blocks/TableBlock'
import { GridBlock } from './blocks/GridBlock'
import { CollectionCardBlock } from './blocks/CollectionCardBlock'
import { DividerBlock } from './blocks/DividerBlock'
import { SectionBlock } from './blocks/SectionBlock'
import { IconLibraryBlock } from './blocks/IconLibraryBlock'
import { CheckmarksBlock } from './blocks/CheckmarksBlock'
import { CrossesBlock } from './blocks/CrossesBlock'
import styles from './blocks/Blocks.module.css'

type Block = NonNullable<ContentPage['layout']>[number]
type CollectionBlock = Extract<Block, { blockType: 'collectionCardBlock' }>

function isSmallCollection(block: Block): block is CollectionBlock {
  return block.blockType === 'collectionCardBlock' && (block as CollectionBlock).cardModel === 'small'
}

interface Props {
  blocks: Block[]
}

export function BlockRenderer({ blocks }: Props) {
  const rendered: React.ReactNode[] = []
  let i = 0

  while (i < blocks.length) {
    const block = blocks[i]
    const key = block.id ?? i

    // Pair consecutive small collection cards side-by-side
    if (isSmallCollection(block) && i + 1 < blocks.length && isSmallCollection(blocks[i + 1])) {
      const nextBlock = blocks[i + 1]
      const nextKey = nextBlock.id ?? (i + 1)
      rendered.push(
        <div key={`pair-${key}`} className={styles.collectionCardPair}>
          <CollectionCardBlock key={key} block={block as CollectionBlock} />
          <CollectionCardBlock key={nextKey} block={nextBlock as CollectionBlock} />
        </div>
      )
      i += 2
      continue
    }

    switch (block.blockType) {
      case 'richText':
        rendered.push(<RichTextBlock key={key} block={block} />)
        break
      case 'quoteBlock':
        rendered.push(<QuoteBlock key={key} block={block} />)
        break
      case 'noteBlock':
        rendered.push(<NoteBlock key={key} block={block} />)
        break
      case 'tableBlock':
        rendered.push(<TableBlock key={key} block={block} />)
        break
      case 'gridBlock':
        rendered.push(<GridBlock key={key} block={block} />)
        break
      case 'collectionCardBlock':
        rendered.push(<CollectionCardBlock key={key} block={block as CollectionBlock} />)
        break
      case 'dividerBlock':
        rendered.push(<DividerBlock key={key} block={block} />)
        break
      case 'sectionBlock':
        rendered.push(<SectionBlock key={key} block={block} />)
        break
      case 'iconLibraryBlock':
        rendered.push(<IconLibraryBlock key={key} block={block} />)
        break
      case 'checkmarksBlock':
        rendered.push(<CheckmarksBlock key={key} block={block} />)
        break
      case 'crossesBlock':
        rendered.push(<CrossesBlock key={key} block={block} />)
        break
    }
    i++
  }

  return <>{rendered}</>
}
