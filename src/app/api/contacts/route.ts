import { NextRequest, NextResponse } from 'next/server';
import { getContacts, saveContacts, IContact } from '@/lib/jsonDatabase';
import crypto from 'crypto';

export async function GET() {
  try {
    const contacts = await getContacts();
    contacts.sort((a, b) => a.serialNumber - b.serialNumber);
    return NextResponse.json({ success: true, data: contacts });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch contacts: ' + error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phoneNumber, place } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json({ success: false, message: 'Full name and phone number are required.' }, { status: 400 });
    }

    const contacts = await getContacts();
    let maxSerial = 0;
    for (const c of contacts) {
      if (c.serialNumber > maxSerial) maxSerial = c.serialNumber;
    }

    const newContact: IContact = {
      _id: crypto.randomUUID(),
      serialNumber: maxSerial + 1,
      fullName,
      phoneNumber,
      place: place || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contacts.push(newContact);
    await saveContacts(contacts);

    return NextResponse.json({ success: true, data: newContact }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
