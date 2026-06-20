import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

// Define Mongoose Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true
  },
  mark: {
    type: Number,
    min: [0, 'Marks cannot be less than 0.'],
    max: [70, 'Marks cannot be more than 70.']
  },
  feedback: {
    type: String,
    trim: true,
    default: ''
  },
  time: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'user', 
  versionKey: false 
});

// Avoid OverwriteModelError in Next.js hot-reloads
const User = mongoose.models.User || mongoose.model('User', userSchema);

export async function POST(request) {
  try {
    // Establish database connection
    await dbConnect();

    // Parse payload
    const body = await request.json();
    const name = (body.name || '').trim();
    const message = (body.message || '').trim();
    const predictedMarks = body.predictedMarks !== undefined && body.predictedMarks !== '' ? Number(body.predictedMarks) : undefined;

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    // Create and save mongoose document (validates automatically using schema)
    const newUser = new User({
      name: name,
      mark: predictedMarks,
      feedback: message
    });

    await newUser.save();
    console.log(`[Mongoose API] Saved user: "${name}" to collection: "user"`);

    return NextResponse.json({ 
      success: true, 
      message: 'Recorded in MongoDB database collection: "user"!' 
    });
  } catch (error) {
    console.error("[Mongoose API] Error saving user:", error.message);
    return NextResponse.json({ 
      error: error.message || 'Failed to save to database.' 
    }, { status: 500 });
  }
}
