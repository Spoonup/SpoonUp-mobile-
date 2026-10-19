import type { Address, AddressInput } from '../types';

// MOCK: in-memory store standing in for the addresses API.
let addresses: Address[] = [];
let nextId = 1;

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 300));

export const addressService = {
  // MOCK: replace with API (GET /addresses, scoped to the signed-in user).
  async list(): Promise<Address[]> {
    await delay();
    return addresses;
  },
  // MOCK: replace with API (POST /addresses, PUT /addresses/:id). The backend
  // re-validates the payload and enforces ownership.
  async save(input: AddressInput, id?: string): Promise<Address> {
    await delay();
    const saved: Address = { ...input, id: id ?? `addr-${nextId++}` };
    addresses = id
      ? addresses.map(item => (item.id === id ? saved : item))
      : [...addresses, saved];
    return saved;
  },
  // MOCK: replace with API (DELETE /addresses/:id). The backend enforces
  // ownership.
  async remove(id: string): Promise<void> {
    await delay();
    addresses = addresses.filter(item => item.id !== id);
  },
};
