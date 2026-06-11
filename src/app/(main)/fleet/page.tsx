import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Car, Users, Briefcase, Check, ArrowRight } from 'lucide-react';
import prisma from '@/lib/db';
import { cn } from '@/lib/utils'; // Assuming cn exists

export const metadata: Metadata = {
    title: 'Our Fleet | TravelStore Turkey',
    description: 'Explore our luxury fleet of vehicles. From comfortable sedans to spacious vans, we have the perfect vehicle for your journey in Turkey.',
};

export const revalidate = 3600;

export default async function FleetPage() {
    // Fall back to an empty fleet if the database is unavailable (demo / no DB).
    const vehicles = await prisma.vehicle
        .findMany({
            where: {
                status: {
                    not: 'RETIRED',
                },
                // prioritizing vehicles with images if we had them, but for now just fetching all
            },
            orderBy: {
                type: 'asc',
            },
        })
        .catch(() => [] as Awaited<ReturnType<typeof prisma.vehicle.findMany>>);

    // Group by type to show unique classes
    // actually, let's just show unique Make/Models to avoid duplicates if we have 5 identical cars
    const uniqueVehicles = Array.from(
        new Map(vehicles.map((v) => [`${v.make}-${v.model}`, v])).values()
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Hero */}
            <div className="relative py-20 bg-secondary overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[50%] -right-[10%] w-[80%] h-[200%] bg-white/5 rotate-12 blur-3xl rounded-[100%]" />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Our Luxury <span className="text-primary">Fleet</span>
                    </h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        Travel in comfort and style. Our modern fleet is rigorously maintained
                        to ensure your safety and satisfaction on Turkish roads.
                    </p>
                </div>
            </div>

            {/* Fleet Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {uniqueVehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                        >
                            {/* Image Placeholder */}
                            <div className="relative h-48 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                {/*  If we had real images, we'd use them. For now, use a generic placeholder or the vehicle image URL if valid */}
                                {vehicle.image ? (
                                    <Image
                                        src={vehicle.image}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <Car className="size-16 text-slate-400" />
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wider">
                                    {vehicle.type}
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                    {vehicle.make} {vehicle.model}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="size-4" />
                                        <span>Max {vehicle.capacity}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="size-4" />
                                        <span>Luggage: {Math.floor(vehicle.capacity * 0.75)}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-2 mb-8 flex-1">
                                    {vehicle.features.slice(0, 4).map((feature) => (
                                        <div key={feature} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                            <Check className="size-4 text-primary shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {vehicle.features.length > 4 && (
                                        <p className="text-xs text-slate-400 pl-6">+ {vehicle.features.length - 4} more features</p>
                                    )}
                                </div>

                                <Link
                                    href={`/booking?type=${vehicle.type === 'VAN' ? 'AIRPORT_TRANSFER' : 'TAXI'}&from=service`}
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-primary hover:text-slate-900 dark:hover:bg-primary transition-colors"
                                >
                                    Book This Vehicle
                                    <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {uniqueVehicles.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500">No vehicles currently available for display.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
