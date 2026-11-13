import { apiClient } from '../../../services/api/client';
import { endpoints } from '../../../services/api/endpoints';
import { mocksEnabled } from '../../../services/api/mode';
import type { Address, AddressInput } from '../types';

// MOCK store (used when USE_MOCKS is on).
let addresses: Address[] = [];
let nextId = 1;

const delay = () => new Promise<void>(resolve => setTimeout(resolve, 300));

// Backend address (/api/me/addresses). It has no recipient name/phone: those
// are checkout contact fields on the backend, so the app keeps them locally
// per address id.
// TODO(api): backend gap, name/phone are not stored with an address.
type ApiAddress = {
  id: string;
  label: string;
  line1: string;
  city: string;
  pincode: string;
};
const contacts = new Map<string, { name: string; phone: string }>();

const fromApi = (a: ApiAddress): Address => ({
  id: a.id,
  name: contacts.get(a.id)?.name ?? a.label,
  phone: contacts.get(a.id)?.phone ?? '',
  line1: a.line1,
  city: a.city,
  pincode: a.pincode,
});

export const addressService = {
  async list(): Promise<Address[]> {
    if (!mocksEnabled) {
      const rows = await apiClient.get<ApiAddress[]>(endpoints.addresses);
      return rows.map(fromApi);
    }
    await delay();
    return addresses;
  },
  async save(input: AddressInput, id?: string): Promise<Address> {
    if (!mocksEnabled) {
      const body = {
        label: input.name.trim().slice(0, 40),
        line1: input.line1,
        city: input.city,
        pincode: input.pincode,
      };
      const row = id
        ? await apiClient.patch<ApiAddress>(
            `${endpoints.addresses}/${id}`,
            body,
          )
        : await apiClient.post<ApiAddress>(endpoints.addresses, body);
      contacts.set(row.id, { name: input.name, phone: input.phone });
      return fromApi(row);
    }
    await delay();
    const saved: Address = { ...input, id: id ?? `addr-${nextId++}` };
    addresses = id
      ? addresses.map(item => (item.id === id ? saved : item))
      : [...addresses, saved];
    return saved;
  },
  async remove(id: string): Promise<void> {
    if (!mocksEnabled) {
      await apiClient.delete(`${endpoints.addresses}/${id}`);
      return;
    }
    await delay();
    addresses = addresses.filter(item => item.id !== id);
  },
};
