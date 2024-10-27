import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'


export async function POST(request: Request) {
  try {
    const { name, code, icon, userId, imageUrl } = await request.json()

    const publishedApp = await prisma.publishedApp.create({
      data: {
        name,
        code,
        icon,
        userId,
        imageUrl
      },
    })

    return NextResponse.json(publishedApp)
  } catch (error) {
    console.error('Error publishing app:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        if (!userId) {
            return NextResponse.json({ error: 'UserId is required' }, { status: 400 })
        }
        const publishedApps = await prisma.publishedApp.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return NextResponse.json(publishedApps)
    } catch (error) {
        console.error('Error fetching published apps:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
