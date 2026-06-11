import {
  Booking,
  Tour,
  Driver,
  Vehicle,
  User,
  BookingType,
  BookingStatus,
  PaymentStatus,
  TourCategory,
  DriverStatus,
  VehicleType,
  VehicleStatus,
} from '@prisma/client';

export type {
  Booking,
  Tour,
  Driver,
  Vehicle,
  User,
  BookingType,
  BookingStatus,
  PaymentStatus,
  TourCategory,
  DriverStatus,
  VehicleType,
  VehicleStatus,
};

export interface BookingWithRelations extends Booking {
  tour?: Tour | null;
  driver?: Driver | null;
  vehicle?: Vehicle | null;
}

export interface DriverWithVehicle extends Driver {
  vehicle?: Vehicle | null;
}

export interface TourWithBookings extends Tour {
  bookings?: Booking[];
}

export interface DashboardStats {
  todayRevenue: number;
  activeDrivers: number;
  totalDrivers: number;
  pendingBookings: number;
  todayTours: number;
  revenueChange: number;
  toursChange: number;
}

export interface RevenueData {
  day: string;
  taxi: number;
  tours: number;
  total: number;
}

export interface PopularLocation {
  name: string;
  count: number;
  percentage: number;
}

export interface BookingFormData {
  type: BookingType;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  passengers: number;
  pickupLocation: string;
  dropoffLocation?: string;
  pickupDate: string;
  pickupTime: string;
  tourId?: string;
  specialRequests?: string;
}

export interface PricingCard {
  id: string;
  title: string;
  icon: string;
  priceLabel: string;
  price: string;
  priceSubtext: string;
  priceNote: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
}

export interface FAQItem {
  id: string;
  icon: string;
  question: string;
  answer: string;
}

export interface TourCard {
  id: string;
  name: string;
  slug: string;
  category: TourCategory;
  duration: string;
  shortDescription: string;
  price: number;
  currency: string;
  image: string;
  badge?: {
    text: string;
    type: 'popular' | 'seasonal' | 'transfer';
  };
  highlights: string[];
}
