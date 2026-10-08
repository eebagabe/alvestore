export interface Address {
  zipCode: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
}

export interface Account {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  address: Address | null
}

export const emptyAddress = (): Address => ({
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  city: '',
  state: '',
})

export const formatAddress = (a: Address) =>
  `${a.street}, ${a.number}${a.complement ? ` - ${a.complement}` : ''} - ${a.district}, ${a.city}/${a.state} - CEP ${a.zipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2')}`
