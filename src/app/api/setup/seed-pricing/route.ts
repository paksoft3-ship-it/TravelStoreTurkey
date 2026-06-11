import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

const pricingDefaults: Record<string, string> = {
  airportTransferPrice: '20000',
  blueLagoonTransferPrice: '20000',
  kefBlueLagoonPrice: '15000',
  cruisePortPrice: '25000',
  cityTourBasePrice: '10500',
  privateTourBasePrice: '45000',
  customTourBasePrice: '60000',
  blueLagoonRoundtripPrice: '39000',
  blueLagoonComboPrice: '40000',
  blueLagoonComboLargeGroupPrice: '50000',
  hourlyHireRate: '12000',
};

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: { key: string; status: string }[] = [];

    for (const [key, value] of Object.entries(pricingDefaults)) {
      const existing = await prisma.setting.findUnique({ where: { key } });
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      results.push({ key, status: existing ? 'updated' : 'created' });
    }

    return NextResponse.json({ message: 'Pricing seed complete', results });
  } catch (error) {
    console.error('Seed pricing error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
