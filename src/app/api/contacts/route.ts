import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function GET() {
  try {
    await connectDB();
    const contacts = await Contact.find({}).sort({ serialNumber: 1 });
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error('GET /api/contacts error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, phoneNumber, place } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Full name and phone number are required.' },
        { status: 400 }
      );
    }

    const lastContact = await Contact.findOne({}).sort({ serialNumber: -1 });
    const serialNumber = lastContact ? lastContact.serialNumber + 1 : 1;

    const contact = await Contact.create({ serialNumber, fullName, phoneNumber, place: place || '' });
    return NextResponse.json({ success: true, data: contact }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/contacts error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
