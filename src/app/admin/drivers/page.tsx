'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Star,
  Phone,
  Mail,
  Car,
  MapPin,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  licensePlate: string;
}

interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_TOUR' | 'OFFLINE' | 'BREAK';
  rating: number;
  totalTrips: number;
  vehicle: Vehicle | null;
  vehicleId: string | null;
  image: string | null;
  createdAt: string;
  _count?: { bookings: number };
}

interface DriverFormData {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  status: 'AVAILABLE' | 'ON_TOUR' | 'OFFLINE' | 'BREAK';
  vehicleId: string | null;
  image: string | null;
}

const initialFormData: DriverFormData = {
  name: '',
  email: '',
  phone: '',
  licenseNumber: '',
  status: 'OFFLINE',
  vehicleId: null,
  image: null,
};

const statusConfig = {
  AVAILABLE: { label: 'Available', style: 'bg-green-50 text-green-700 border-green-200', dotColor: 'bg-green-500' },
  ON_TOUR: { label: 'On Tour', style: 'bg-yellow-50 text-yellow-700 border-yellow-200', dotColor: 'bg-yellow-500' },
  OFFLINE: { label: 'Offline', style: 'bg-slate-100 text-slate-600 border-slate-200', dotColor: 'bg-slate-400' },
  BREAK: { label: 'On Break', style: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500' },
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch drivers
  const fetchDrivers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/drivers?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch drivers');
      const data = await response.json();
      setDrivers(data.drivers);
      setError(null);
    } catch (err) {
      setError('Failed to load drivers');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vehicles for dropdown
  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/admin/vehicles');
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      // Filter to only show available vehicles (not assigned to other drivers)
      const availableVehicles = data.vehicles.filter(
        (v: any) => v.status === 'AVAILABLE' || !v.driver
      );
      setVehicles(availableVehicles);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchVehicles();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchDrivers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, statusFilter]);

  const filteredDrivers = drivers;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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

  // Handle Add Driver
  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add driver');
      }

      toast.success('Driver added successfully');
      setShowAddModal(false);
      setFormData(initialFormData);
      fetchDrivers();
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Driver
  const handleEditDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/drivers/${selectedDriver.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update driver');
      }

      toast.success('Driver updated successfully');
      setShowEditModal(false);
      setFormData(initialFormData);
      setSelectedDriver(null);
      fetchDrivers();
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Driver
  const handleDeleteDriver = async () => {
    if (!selectedDriver) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/drivers/${selectedDriver.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete driver');
      }

      toast.success('Driver deleted successfully');
      setShowDeleteConfirm(false);
      setShowDetailModal(false);
      setSelectedDriver(null);
      fetchDrivers();
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete driver');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal with driver data
  const openEditModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
      vehicleId: driver.vehicleId,
      image: driver.image,
    });
    setShowEditModal(true);
  };

  // Stats calculation
  const stats = {
    total: drivers.length,
    available: drivers.filter((d) => d.status === 'AVAILABLE').length,
    onTour: drivers.filter((d) => d.status === 'ON_TOUR').length,
    avgRating: drivers.length > 0
      ? (drivers.reduce((acc, d) => acc + d.rating, 0) / drivers.length).toFixed(1)
      : '0.0',
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
            fetchDrivers();
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
            Driver Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your team of professional drivers
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-yellow-400 transition-all"
        >
          <Plus className="size-4" />
          Add Driver
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Drivers', value: stats.total, icon: Users, color: 'bg-slate-100 text-slate-600' },
          { label: 'Available', value: stats.available, icon: Check, color: 'bg-green-100 text-green-600' },
          { label: 'On Tour', value: stats.onTour, icon: Car, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'bg-amber-100 text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={cn('p-3 rounded-lg', stat.color)}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search drivers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TOUR">On Tour</option>
          <option value="BREAK">On Break</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => {
          const status = statusConfig[driver.status];
          return (
            <div
              key={driver.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden hover:border-primary/50 transition-colors"
            >
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn('size-12 rounded-full flex items-center justify-center font-bold text-sm', getAvatarColor(driver.name))}>
                        {getInitials(driver.name)}
                      </div>
                      <div className={cn('absolute bottom-0 right-0 size-3 rounded-full border-2 border-white dark:border-slate-800', status.dotColor)} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{driver.name}</h3>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border', status.style)}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating & Trips */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{driver.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <TrendingUp className="size-4" />
                    <span className="text-sm">{driver.totalTrips} trips</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Mail className="size-4 text-slate-400" />
                    {driver.email}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Phone className="size-4 text-slate-400" />
                    {driver.phone}
                  </p>
                </div>

                {/* Vehicle */}
                {driver.vehicle ? (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Car className="size-4 text-slate-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {driver.vehicle.make} {driver.vehicle.model}
                      </span>
                      <span className="text-slate-500">({driver.vehicle.licensePlate})</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <Car className="size-4" />
                      No vehicle assigned
                    </p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="flex border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    setSelectedDriver(driver);
                    setShowDetailModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                >
                  <Eye className="size-4" />
                  View
                </button>
                <div className="w-px bg-slate-100 dark:bg-slate-700" />
                <button
                  onClick={() => openEditModal(driver)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                >
                  <Edit className="size-4" />
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDrivers.length === 0 && (
        <div className="text-center py-12">
          <Users className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No drivers found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Driver Detail Modal */}
      {showDetailModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={cn('size-16 rounded-full flex items-center justify-center font-bold text-xl', getAvatarColor(selectedDriver.name))}>
                    {getInitials(selectedDriver.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDriver.name}</h3>
                    <p className="text-slate-500 text-sm">{selectedDriver.id}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <Star className="size-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDriver.rating.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">Rating</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <TrendingUp className="size-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedDriver.totalTrips}</p>
                  <p className="text-xs text-slate-500">Total Trips</p>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <Calendar className="size-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{new Date(selectedDriver.createdAt).getFullYear()}</p>
                  <p className="text-xs text-slate-500">Joined</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Status</span>
                  <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border', statusConfig[selectedDriver.status].style)}>
                    {statusConfig[selectedDriver.status].label}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Email</span>
                  <span className="text-slate-900 dark:text-white">{selectedDriver.email}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">Phone</span>
                  <span className="text-slate-900 dark:text-white">{selectedDriver.phone}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-slate-500">License</span>
                  <span className="text-slate-900 dark:text-white font-mono text-sm">{selectedDriver.licenseNumber}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="text-slate-900 dark:text-white">
                    {selectedDriver.vehicle ? `${selectedDriver.vehicle.make} ${selectedDriver.vehicle.model}` : 'Not assigned'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedDriver);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors"
                >
                  <Edit className="size-4" />
                  Edit Driver
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Driver</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAddDriver} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="driver@travelstoreturkey.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="+354 555 0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="IS-DL-XXXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="OFFLINE">Offline</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_TOUR">On Tour</option>
                    <option value="BREAK">On Break</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Vehicle (Optional)</label>
                  <select
                    value={formData.vehicleId || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="">No vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>
                <ImageUpload
                  label="Profile Photo (Optional)"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url || null })}
                  aspect="square"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    Add Driver
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Driver</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleEditDriver} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="driver@travelstoreturkey.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="+354 555 0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    placeholder="IS-DL-XXXX-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="OFFLINE">Offline</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="ON_TOUR">On Tour</option>
                    <option value="BREAK">On Break</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assign Vehicle (Optional)</label>
                  <select
                    value={formData.vehicleId || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="">No vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                      </option>
                    ))}
                    {/* Show current vehicle if it's assigned to this driver */}
                    {selectedDriver.vehicle && !vehicles.find(v => v.id === selectedDriver.vehicleId) && (
                      <option value={selectedDriver.vehicleId!}>
                        {selectedDriver.vehicle.make} {selectedDriver.vehicle.model} ({selectedDriver.vehicle.licensePlate}) - Current
                      </option>
                    )}
                  </select>
                </div>
                <ImageUpload
                  label="Profile Photo (Optional)"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url || null })}
                  aspect="square"
                />

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Driver</h3>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedDriver.name}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDriver}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
