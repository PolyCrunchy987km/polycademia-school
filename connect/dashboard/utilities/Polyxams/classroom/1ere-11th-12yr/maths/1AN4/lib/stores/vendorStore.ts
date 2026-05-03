import { writable } from 'svelte/store'

export type VendorEntity = {
  name: string
  logoPath: string
}
export type Vendor = {
  brand: VendorEntity
  product: VendorEntity
}

export const vendor = writable<Vendor>({
  brand: {
    name: 'bordas',
    logoPath: '',
  },
  product: {
    name: 'indices',
    logoPath: 'assets/images/vendors/bordas/indices−bordas-logo.png',
  },
})
