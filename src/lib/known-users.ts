export type KnownUser = {
  id: string
  name: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export const knownUsers: KnownUser[] = [
  {
    id: 'known-user-1',
    name: 'Dr. Frasier Crane',
    email: 'frasier.crane@kacl780.com',
    address: '700 Elliott Bay Towers',
    city: 'Seattle',
    state: 'Washington',
    zipCode: '98101',
    country: 'USA',
  },
  {
    id: 'known-user-2',
    name: 'Alan Partridge',
    email: 'alan.partridge@acmepartridge.co.uk',
    address: 'The Linton Travel Tavern, A10',
    city: 'Norwich',
    state: 'Norfolk',
    zipCode: 'NR1 1AA',
    country: 'UK',
  },
  {
    id: 'known-user-3',
    name: 'Dave Catching',
    email: 'dave.catching@earthlings.com',
    address: '1000 Joshua Tree Lane',
    city: 'Joshua Tree',
    state: 'California',
    zipCode: '92252',
    country: 'USA',
  },
]
