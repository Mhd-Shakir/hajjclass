import fs from 'fs/promises';
import path from 'path';

export interface IContact {
  _id: string;
  serialNumber: number;
  fullName: string;
  phoneNumber: string;
  place?: string;
  createdAt: string;
  updatedAt: string;
}

const dbPath = path.join(process.cwd(), 'data');
const dbFile = path.join(dbPath, 'contacts.json');

async function ensureDb() {
  try {
    await fs.mkdir(dbPath, { recursive: true });
    try {
      await fs.access(dbFile);
    } catch {
      await fs.writeFile(dbFile, JSON.stringify([]), 'utf-8');
    }
  } catch (error) {
    console.error('Failed to init DB:', error);
  }
}

export async function getContacts(): Promise<IContact[]> {
  await ensureDb();
  const data = await fs.readFile(dbFile, 'utf-8');
  return JSON.parse(data);
}

export async function saveContacts(contacts: IContact[]) {
  await ensureDb();
  await fs.writeFile(dbFile, JSON.stringify(contacts, null, 2), 'utf-8');
}
