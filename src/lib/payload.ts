import { getPayload as initPayload } from 'payload'
import config from '@payload-config'

export async function getPayload() {
  return initPayload({ config })
}
