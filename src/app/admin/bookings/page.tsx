'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  Clock,
  CarTaxiFront,
  Mountain,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  User,
  CreditCard,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Booking {
  id: string;
  bookingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  type: 'TAXI' | 'AIRPORT_TRANSFER' | 'PRIVATE_TOUR' | 'CUSTOM_TOUR';
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropoffLocation: string | null;
  passengers: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  totalPrice: number;
  specialRequests: string | null;
  tour: { id: string; name: string; slug: string } | null;
  driver: { id: string; name: string; phone: string } | null;
  vehicle: { id: string; make: string; model: string; licensePlate: string } | null;
  createdAt: string;
}

const statusConfig = {
  PENDING: { label: 'Pending', style: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Confirmed', style: 'bg-blue-50 text-blue-700 border-blue-200', icon: Check },
  IN_PROGRESS: { label: 'In Progress', style: 'bg-green-50 text-green-700 border-green-200', icon: CarTaxiFront },
  COMPLETED: { label: 'Completed', style: 'bg-slate-100 text-slate-600 border-slate-200', icon: Check },
  CANCELLED: { label: 'Cancelled', style: 'bg-red-50 text-red-700 border-red-200', icon: X },
};

const paymentStatusConfig = {
  PENDING: { label: 'Pending', style: 'text-yellow-600' },
  PAID: { label: 'Paid', style: 'text-green-600' },
  REFUNDED: { label: 'Refunded', style: 'text-slate-500' },
  FAILED: { label: 'Failed', style: 'text-red-600' },
};

const serviceTypeConfig = {
  TAXI: { label: 'Taxi', style: 'bg-blue-50 text-blue-700 border-blue-100', icon: CarTaxiFront },
  AIRPORT_TRANSFER: { label: 'Airport', style: 'bg-cyan-50 text-cyan-700 border-cyan-100', icon: CarTaxiFront },
  PRIVATE_TOUR: { label: 'Private Tour', style: 'bg-purple-50 text-purple-700 border-purple-100', icon: Mountain },
  CUSTOM_TOUR: { label: 'Custom Tour', style: 'bg-pink-50 text-pink-700 border-pink-100', icon: Mountain },
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [counts, setCounts] = useState({ pending: 0, confirmed: 0, today: 0 });

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      params.set('page', page.toString());
      params.set('limit', '20');

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data.bookings);
      setPagination(data.pagination);
      setCounts(data.counts);
      setError(null);
    } catch (err) {
      setError('Failed to load bookings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setPage(1);
      fetchBookings();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, statusFilter]);

  // Update booking status
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      toast.success(`Booking ${newStatus.toLowerCase().replace('_', ' ')}`);
      fetchBookings();
      if (selectedBooking?.id === bookingId) {
        const data = await response.json();
        setSelectedBooking(data.booking);
      }
    } catch (err) {
      toast.error('Failed to update booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel booking (status → CANCELLED)
  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      toast.success('Booking cancelled');
      setShowCancelConfirm(false);
      const data = await response.json();
      setSelectedBooking(data.booking);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to cancel booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete booking permanently
  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete booking');

      toast.success('Booking deleted from records');
      setShowDeleteConfirm(false);
      setShowDetailModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      toast.error('Failed to delete booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials and color for customer avatar
  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600',
      'bg-teal-100 text-teal-600',
      'bg-amber-100 text-amber-600',
      'bg-emerald-100 text-emerald-600',
      'bg-purple-100 text-purple-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('is-IS') + ' ISK';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="size-12 text-red-500" />
        <p className="text-lg text-slate-600 dark:text-slate-400">{error}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchBookings();
          }}
          className="px-4 py-2 bg-primary text-black rounded-lg font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bookings Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            View and manage all taxi and tour bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white">
            <Download className="size-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: pagination.total, color: 'text-slate-900' },
          { label: 'Pending', value: counts.pending, color: 'text-yellow-600' },
          { label: 'Confirmed', value: counts.confirmed, color: 'text-blue-600' },
          { label: 'Today', value: counts.today, color: 'text-green-600' },
          { label: 'This Page', value: bookings.length, color: 'text-slate-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className={cn('text-2xl font-bold', stat.color, 'dark:text-white')}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
            <input
              type="text"
              placeholder="Search by booking ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4">Booking ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {bookings.map((booking) => {
                const status = statusConfig[booking.status];
                const payment = paymentStatusConfig[booking.paymentStatus];
                const serviceType = serviceTypeConfig[booking.type];
                const StatusIcon = status.icon;
                const ServiceIcon = serviceType.icon;

                return (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {booking.bookingNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn('size-9 rounded-full flex items-center justify-center font-bold text-xs', getAvatarColor(booking.customerName))}>
                          {getCustomerInitials(booking.customerName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {booking.customerName}
                          </span>
                          <span className="text-xs text-slate-500">{booking.passengers} passengers</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn('inline-flex w-fit items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border', serviceType.style)}>
                          <ServiceIcon className="size-3" />
                          {serviceType.label}
                        </span>
                        <span className="text-sm text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                          {booking.tour?.name || `${booking.pickupLocation} → ${booking.dropoffLocation || 'TBD'}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(booking.pickupDate)}</span>
                        <span className="text-xs text-slate-500">{booking.pickupTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', status.style)}>
                        <StatusIcon className="size-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-sm font-semibold', payment.style)}>
                        {payment.label}
                      </span>
                    </td>
                    <td className={cn('px-6 py-4 text-right text-sm font-bold', booking.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white')}>
                      {formatCurrency(booking.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="size-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <span className="text-sm text-slate-500">
            Page {page} of {pagination.totalPages} ({pagination.total} total bookings)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-900 bg-white border border-slate-200 rounded hover:bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white disabled:opacity-50"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Booking {selectedBooking.bookingNumber}
                </h3>
                <p className="text-sm text-slate-500">Created on {formatDate(selectedBooking.createdAt)}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status Row */}
              <div className="flex flex-wrap gap-3">
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border', statusConfig[selectedBooking.status].style)}>
                  {statusConfig[selectedBooking.status].label}
                </span>
                <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-slate-100', paymentStatusConfig[selectedBooking.paymentStatus].style)}>
                  <CreditCard className="size-4" />
                  Payment: {paymentStatusConfig[selectedBooking.paymentStatus].label}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <User className="size-4" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className={cn('size-10 rounded-full flex items-center justify-center font-bold text-sm', getAvatarColor(selectedBooking.customerName))}>
                      {getCustomerInitials(selectedBooking.customerName)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedBooking.customerName}</p>
                      <p className="text-sm text-slate-500">{selectedBooking.passengers} passengers</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <Mail className="size-4 text-slate-400" />
                      {selectedBooking.customerEmail}
                    </p>
                    {selectedBooking.customerPhone && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                        <Phone className="size-4 text-slate-400" />
                        {selectedBooking.customerPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <MapPin className="size-4" />
                  Trip Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold border', serviceTypeConfig[selectedBooking.type].style)}>
                      {serviceTypeConfig[selectedBooking.type].label}
                    </span>
                    {selectedBooking.tour && (
                      <span className="text-slate-700 dark:text-slate-300">{selectedBooking.tour.name}</span>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <p><strong>Pickup:</strong> {selectedBooking.pickupLocation}</p>
                    {selectedBooking.dropoffLocation && (
                      <p><strong>Dropoff:</strong> {selectedBooking.dropoffLocation}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Calendar className="size-4 text-slate-400" />
                      {formatDate(selectedBooking.pickupDate)}
                    </span>
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Clock className="size-4 text-slate-400" />
                      {selectedBooking.pickupTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2">Special Requests</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-400">{selectedBooking.specialRequests}</p>
                </div>
              )}

              {/* Assignment */}
              {(selectedBooking.driver || selectedBooking.vehicle) && (
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Assignment</h4>
                  <div className="flex items-center gap-4">
                    {selectedBooking.driver && (
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Driver:</strong> {selectedBooking.driver.name}
                      </span>
                    )}
                    {selectedBooking.vehicle && (
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Vehicle:</strong> {selectedBooking.vehicle.make} {selectedBooking.vehicle.model}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t border-slate-200 dark:border-slate-600 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Total Amount</span>
                  <span className={cn('text-2xl font-bold', selectedBooking.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-primary')}>
                    {formatCurrency(selectedBooking.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              {/* Left: Delete permanently */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
                title="Delete booking from records permanently"
              >
                <Trash2 className="size-4" />
                Delete
              </button>

              {/* Right: Status actions + close */}
              <div className="flex items-center gap-3">
                {selectedBooking.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <X className="size-4" />
                      Cancel Booking
                    </button>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'CONFIRMED')}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                      <Check className="size-4" />
                      Confirm Booking
                    </button>
                  </>
                )}
                {selectedBooking.status === 'CONFIRMED' && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'IN_PROGRESS')}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    <CarTaxiFront className="size-4" />
                    Start Trip
                  </button>
                )}
                {selectedBooking.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'COMPLETED')}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    <Check className="size-4" />
                    Complete Trip
                  </button>
                )}
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowCancelConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
                <X className="size-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Cancel Booking</h3>
              <p className="text-center text-slate-500 mb-6">
                Mark booking <span className="font-semibold">{selectedBooking.bookingNumber}</span> as cancelled? The record will remain in the system.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Booking</h3>
              <p className="text-center text-slate-500 mb-6">
                Permanently delete booking <span className="font-semibold">{selectedBooking.bookingNumber}</span>? This cannot be undone and the record will be gone forever.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Keep Record
                </button>
                <button
                  onClick={handleDeleteBooking}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
