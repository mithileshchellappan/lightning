import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { imageUrl } = await request.json()
  const image = await prisma.images.create({
    data: { imageUrl }
  })
  return NextResponse.json(image)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Id is required' }, { status: 400 })
  }
  const image = await prisma.images.findUnique({ where: { id } })
  return NextResponse.json(image)
}