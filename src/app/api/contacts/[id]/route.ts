import { NextRequest, NextResponse } from 'next/server';
import { getContacts, saveContacts } from '@/lib/jsonDatabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { fullName, phoneNumber, place } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json({ success: false, message: 'Full name and phone number are required.' }, { status: 400 });
    }

    const contacts = await getContacts();
    const index = contacts.findIndex(c => c._id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });
    }

    contacts[index] = {
      ...contacts[index],
      fullName,
      phoneNumber,
      place: place || '',
      updatedAt: new Date().toISOString()
    };
    await saveContacts(contacts);

    return NextResponse.json({ success: true, data: contacts[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const contacts = await getContacts();
    const index = contacts.findIndex(c => c._id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });
    }

    contacts.splice(index, 1);
    await saveContacts(contacts);

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
