import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contact from '@/models/Contact';
import mongoose from 'mongoose';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid contact ID' }, { status: 400 });
    }

    const body = await req.json();
    const { fullName, phoneNumber, place } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { success: false, message: 'Full name and phone number are required.' },
        { status: 400 }
      );
    }

    const updated = await Contact.findByIdAndUpdate(
      id,
      { fullName, phoneNumber, place: place || '' },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('PUT /api/contacts/[id] error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid contact ID' }, { status: 400 });
    }

    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/contacts/[id] error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
