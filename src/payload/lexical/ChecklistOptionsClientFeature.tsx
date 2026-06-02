'use client'
import { createClientFeature } from '@payloadcms/richtext-lexical/client'
import { $insertList, $isListItemNode, $isListNode } from '@lexical/list'
import { $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'

function CheckmarkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 8L6.5 12L13.5 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckListPluginWrapper() {
  return <CheckListPlugin />
}

function insertChecklist(editor: LexicalEditor, checked: boolean) {
  editor.update(() => {
    $insertList('check')

    if (!checked) return

    const selection = $getSelection()
    if (!$isRangeSelection(selection)) return

    let node = selection.anchor.getNode()
    while (node !== null && !$isListNode(node)) {
      const parent = node.getParent()
      if (parent === null) break
      node = parent
    }

    if ($isListNode(node) && node.getListType() === 'check') {
      for (const child of node.getChildren()) {
        if ($isListItemNode(child)) {
          child.setChecked(true)
        }
      }
    }
  })
}

export const ChecklistOptionsClientFeature = createClientFeature({
  plugins: [
    {
      Component: CheckListPluginWrapper,
      position: 'normal',
    },
  ],
  toolbarFixed: {
    groups: [
      {
        type: 'dropdown',
        items: [
          {
            ChildComponent: CheckmarkIcon,
            key: 'checkmarks',
            label: 'Checkmarks',
            order: 13,
            onSelect: ({ editor }) => {
              insertChecklist(editor, true)
            },
          },
          {
            ChildComponent: CrossIcon,
            key: 'crosses',
            label: 'Crosses',
            order: 14,
            onSelect: ({ editor }) => {
              insertChecklist(editor, false)
            },
          },
        ],
        key: 'text',
      },
    ],
  },
})
