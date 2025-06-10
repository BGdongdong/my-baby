import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const babyId = searchParams.get('babyId')

    if (!babyId) {
      return NextResponse.json({ error: 'Baby ID is required' }, { status: 400 })
    }

    const records = await prisma.growthRecord.findMany({
      where: { babyId },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(records)
  } catch (error) {
    console.error('Error fetching growth records:', error)
    return NextResponse.json({ error: 'Failed to fetch growth records' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const record = await prisma.growthRecord.create({
      data: {
        babyId: data.babyId,
        date: new Date(data.date),
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        headCircumference: data.headCircumference ? parseFloat(data.headCircumference) : null,
        notes: data.notes,
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    console.error('Error creating growth record:', error)
    return NextResponse.json({ error: 'Failed to create growth record' }, { status: 500 })
  }
} 