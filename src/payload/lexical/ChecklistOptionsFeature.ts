import { createServerFeature } from '@payloadcms/richtext-lexical'

export const ChecklistOptionsFeature = createServerFeature({
  feature: {
    ClientFeature: '@/payload/lexical/ChecklistOptionsClientFeature#ChecklistOptionsClientFeature',
  },
  key: 'checklistOptions',
})
