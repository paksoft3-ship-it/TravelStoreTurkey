import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@primetaxi.is' },
    update: {},
    create: {
      email: 'admin@primetaxi.is',
      password: hashedPassword,
      name: 'Jón Gunnarsson',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.upsert({
      where: { licensePlate: 'ICE-001' },
      update: {},
      create: {
        make: 'Mercedes-Benz',
        model: 'V-Class',
        year: 2023,
        licensePlate: 'ICE-001',
        type: 'VAN',
        capacity: 7,
        features: ['WiFi', 'Climate Control', 'USB Charging', 'Leather Seats'],
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'ICE-002' },
      update: {},
      create: {
        make: 'Tesla',
        model: 'Model Y',
        year: 2024,
        licensePlate: 'ICE-002',
        type: 'SUV',
        capacity: 4,
        features: ['Electric', 'Autopilot', 'WiFi', 'Panoramic Roof'],
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.upsert({
      where: { licensePlate: 'ICE-003' },
      update: {},
      create: {
        make: 'Land Rover',
        model: 'Defender',
        year: 2023,
        licensePlate: 'ICE-003',
        type: 'SUV',
        capacity: 5,
        features: ['4x4', 'Off-road', 'WiFi', 'Heated Seats'],
        status: 'AVAILABLE',
      },
    }),
  ]);

  console.log('Created vehicles:', vehicles.length);

  // Create drivers
  const drivers = await Promise.all([
    prisma.driver.upsert({
      where: { email: 'magnus@primetaxi.is' },
      update: {},
      create: {
        name: 'Magnús Ólafsson',
        email: 'magnus@primetaxi.is',
        phone: '+354 555 1001',
        licenseNumber: 'DRV-001',
        status: 'AVAILABLE',
        rating: 4.9,
        totalTrips: 523,
        vehicleId: vehicles[0].id,
      },
    }),
    prisma.driver.upsert({
      where: { email: 'helgi@primetaxi.is' },
      update: {},
      create: {
        name: 'Helgi Sigurðsson',
        email: 'helgi@primetaxi.is',
        phone: '+354 555 1002',
        licenseNumber: 'DRV-002',
        status: 'ON_TOUR',
        rating: 4.8,
        totalTrips: 412,
        vehicleId: vehicles[1].id,
      },
    }),
    prisma.driver.upsert({
      where: { email: 'arnar@primetaxi.is' },
      update: {},
      create: {
        name: 'Arnar Pétursson',
        email: 'arnar@primetaxi.is',
        phone: '+354 555 1003',
        licenseNumber: 'DRV-003',
        status: 'OFFLINE',
        rating: 4.7,
        totalTrips: 287,
        vehicleId: vehicles[2].id,
      },
    }),
  ]);

  console.log('Created drivers:', drivers.length);

  // Create tours
  const tours = await Promise.all([
    prisma.tour.upsert({
      where: { slug: 'golden-circle' },
      update: {},
      create: {
        name: 'Golden Circle Classic',
        slug: 'golden-circle',
        description: `Experience the most famous route in Iceland on this full-day Golden Circle tour. Visit the powerful Gullfoss waterfall, witness the spectacular Geysir geothermal area, and walk through the historic Þingvellir National Park where the tectonic plates meet.

This tour is perfect for first-time visitors who want to see Iceland's most iconic landmarks. Your expert driver-guide will share fascinating stories and hidden gems along the way.`,
        shortDescription: 'Thingvellir, Geysir & Gullfoss',
        duration: '8 Hours',
        durationHours: 8,
        price: 45000,
        currency: 'ISK',
        category: 'FULL_DAY',
        highlights: [
          'Gullfoss Waterfall',
          'Geysir Geothermal Area',
          'Þingvellir National Park',
          'Luxury vehicle with WiFi',
        ],
        includes: [
          'Pick-up & drop-off',
          'Professional guide',
          'WiFi on board',
          'Bottled water',
        ],
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAT4xAiwOYzy5D3pJWuGoHH7APGUplommRj1qLquuXgM3dH_DSqzY9ZE74j7kz-I4a5EYSWm-ymsUkdHZiHmKqgBzLwq-z0bJF4A9vnYvWGdL9dG2lNSNtzYl9dzj37nfDpuwa_LBg86bznhs9wE4QqoPZFU1XBFm8dc4WliNXy2jRQQz41Z_gR2qFB9kyoGp8BjwmPMpFYXfl7iJ-bpYTMPMO0jjiWl8K0buWMIf_MdcvM2DoIKlYh_8ZF2hG-K_LT4L7gK5lw3cv6',
        ],
        featured: true,
        active: true,
      },
    }),
    prisma.tour.upsert({
      where: { slug: 'northern-lights' },
      update: {},
      create: {
        name: 'Northern Lights Hunt',
        slug: 'northern-lights',
        description: `Join us on an unforgettable hunt for the Aurora Borealis. Our expert guides use the latest forecasting technology to find the best viewing locations away from light pollution.

This tour operates from September to April when the northern lights are visible in Iceland. We provide warm blankets and hot chocolate to keep you comfortable while you wait for nature's greatest light show.`,
        shortDescription: 'Hunt for the Aurora Borealis',
        duration: '4 Hours',
        durationHours: 4,
        price: 35000,
        currency: 'ISK',
        category: 'EVENING',
        highlights: [
          'Expert Aurora Tracking',
          'Dark Sky Locations',
          'Hot Chocolate & Blankets',
          'Photography tips',
        ],
        includes: [
          'Pick-up & drop-off',
          'Professional guide',
          'Hot chocolate',
          'Warm blankets',
        ],
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuB9yJ3B9Al8bmIxJTD2BbEOAMvpW_0scC-MVjvxKzeH2C_2rKO9waZoL87HNtEuD-9iHl7u-psWVdEStLcU4-oR3aSX7girGHTq-3SEnfK6sxJ6blhPgUrDasXtg7c7zFxzQj6Au4EezoprIK5uiuffZsuAg9f68xi-rJaThDWQfHaZheDl2E4Hv4eE4mZQ5BRu6L_GjGjEdfJgv5nHDhIHAdlCiZZt-GZQVka3N-PZ_7fQaPnfKXHfaL8XxcOkyEOuuVQOGGfHqHI9',
        ],
        featured: true,
        active: true,
      },
    }),
    prisma.tour.upsert({
      where: { slug: 'south-coast' },
      update: {},
      create: {
        name: 'South Coast Adventure',
        slug: 'south-coast',
        description: `Discover the dramatic South Coast of Iceland on this full-day adventure. Visit stunning waterfalls including Seljalandsfoss (where you can walk behind the waterfall) and the powerful Skógafoss.

Explore the famous black sand beach of Reynisfjara with its basalt columns and visit the charming village of Vík. This tour showcases Iceland's diverse landscapes and raw natural beauty.`,
        shortDescription: 'Waterfalls & Black Sand Beach',
        duration: '10 Hours',
        durationHours: 10,
        price: 55000,
        currency: 'ISK',
        category: 'FULL_DAY',
        highlights: [
          'Seljalandsfoss Waterfall',
          'Skógafoss Waterfall',
          'Reynisfjara Black Sand Beach',
          'Vík Village',
        ],
        includes: [
          'Pick-up & drop-off',
          'Professional guide',
          'WiFi on board',
          'Bottled water',
        ],
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuCKs6YqO20c1r3pE0D8sWRH66wzozCBCzK31rodsy877bxh-F_7A9ZbB4y5EMO1ymwb_JYsNs6icv6zTmCTFNKvX-ERHUWzyyowKLo0F4j1ctYByW2zCmXJ6ROG88q_oMJT1_HidGHogvc6MmiJokry1fkBj1NpbRGSx8e9VOCKQ9elH7dUFL1czKF7asn5GELd63XMPR_AR8wNG0N4opKnTtPb4nxOcmaa12r6USvTMMO9sxD0m9anIypH-N11ricL6apczJp2e6gO',
        ],
        featured: false,
        active: true,
      },
    }),
    prisma.tour.upsert({
      where: { slug: 'blue-lagoon' },
      update: {},
      create: {
        name: 'Blue Lagoon Transfer',
        slug: 'blue-lagoon',
        description: `Enjoy a comfortable and convenient transfer to Iceland's most famous geothermal spa - the Blue Lagoon. Located between Reykjavik and Keflavik Airport, it's the perfect stop before or after your flight.

Our flexible transfer service allows you to relax at the lagoon for as long as you want. We'll pick you up when you're ready to continue your journey.`,
        shortDescription: 'Relaxing Geothermal Spa Transfer',
        duration: 'Flexible',
        durationHours: 4,
        price: 30000,
        currency: 'ISK',
        category: 'TRANSFER',
        highlights: [
          'Door-to-door Service',
          'Flexible timing',
          'Luggage storage',
          'WiFi on board',
        ],
        includes: [
          'Pick-up & drop-off',
          'Waiting time',
          'Luggage storage',
          'WiFi on board',
        ],
        images: [
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBVWeCbujmlEyrgmQ8GQQ4KrfCo9ELZ_L573wLwgKBck7PWSCwohWC6tPekru2ZS7aM6XrDpisc1IXVB4XWg6DQOWEtAak0-ybxa5aPf7A0VKzNCo0smbeNWrr1VFCCJYKL8RY0CrVdKYBER2B4EY0L8WpaahjiMg-SNTM4Q5sRgFPb7XQMkgW9YHw43sDx0I7p9rZfaTp3qMEB_a_X_RKtXOEqikacLPpoD9hYmNg_gpNRFg5vMXR49lbdM0yU7Nk_yoBF3Zg57OmZ',
        ],
        featured: false,
        active: true,
      },
    }),
  ]);

  console.log('Created tours:', tours.length);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
