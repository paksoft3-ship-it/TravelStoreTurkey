'use client';

import { useState, useEffect } from 'react';
import {
  Car,
  Search,
  Plus,
  MoreVertical,
  Users,
  Fuel,
  Calendar,
  Wrench,
  Edit,
  Trash2,
  Eye,
  X,
  Check,
  AlertTriangle,
  Settings,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/admin/ImageUpload';

interface Driver {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY' | 'MINIBUS';
  capacity: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
  features: string[];
  image: string | null;
  driver: Driver | null;
  createdAt: string;
  updatedAt: string;
  _count?: { bookings: number };
}

interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'SEDAN' | 'SUV' | 'VAN' | 'LUXURY' | 'MINIBUS';
  capacity: number;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'RETIRED';
  features: string[];
  image: string | null;
}

const initialFormData: VehicleFormData = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  licensePlate: '',
  type: 'SEDAN',
  capacity: 4,
  status: 'AVAILABLE',
  features: [],
  image: null,
};

const statusConfig = {
  AVAILABLE: { label: 'Available', style: 'bg-green-50 text-green-700 border-green-200', icon: Check },
  IN_USE: { label: 'In Use', style: 'bg-blue-50 text-blue-700 border-blue-200', icon: MapPin },
  MAINTENANCE: { label: 'Maintenance', style: 'bg-orange-50 text-orange-700 border-orange-200', icon: Wrench },
  RETIRED: { label: 'Retired', style: 'bg-slate-100 text-slate-500 border-slate-200', icon: X },
};

const typeConfig = {
  SEDAN: { label: 'Sedan', color: 'bg-slate-100 text-slate-700' },
  SUV: { label: 'SUV', color: 'bg-blue-100 text-blue-700' },
  VAN: { label: 'Van', color: 'bg-purple-100 text-purple-700' },
  LUXURY: { label: 'Luxury', color: 'bg-amber-100 text-amber-700' },
  MINIBUS: { label: 'Minibus', color: 'bg-teal-100 text-teal-700' },
};

const featureOptions = [
  'WiFi',
  'Leather Seats',
  'Climate Control',
  'USB Charging',
  'Premium Sound',
  'Autopilot',
  'Glass Roof',
  'Heated Seats',
  '4x4',
  'Air Suspension',
  'Massage Seats',
  'Refrigerator',
  'PA System',
  'Luggage Space',
];

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureInput, setFeatureInput] = useState('');

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/admin/vehicles?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      const data = await response.json();
      setVehicles(data.vehicles);
      setError(null);
    } catch (err) {
      setError('Failed to load vehicles');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, statusFilter, typeFilter]);

  // Handle Add Vehicle
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add vehicle');
      }

      toast.success('Vehicle added successfully');
      setShowAddModal(false);
      setFormData(initialFormData);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Vehicle
  const handleEditVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle');
      }

      toast.success('Vehicle updated successfully');
      setShowEditModal(false);
      setFormData(initialFormData);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Vehicle
  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/vehicles/${selectedVehicle.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete vehicle');
      }

      toast.success('Vehicle deleted successfully');
      setShowDeleteConfirm(false);
      setShowDetailModal(false);
      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal with vehicle data
  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: vehicle.status,
      features: vehicle.features,
      image: vehicle.image,
    });
    setShowEditModal(true);
  };

  // Add feature to list
  const addFeature = (feature: string) => {
    if (feature && !formData.features.includes(feature)) {
      setFormData({ ...formData, features: [...formData.features, feature] });
    }
    setFeatureInput('');
  };

  // Remove feature from list
  const removeFeature = (feature: string) => {
    setFormData({ ...formData, features: formData.features.filter(f => f !== feature) });
  };

  // Stats calculation
  const stats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === 'AVAILABLE').length,
    inUse: vehicles.filter((v) => v.status === 'IN_USE').length,
    maintenance: vehicles.filter((v) => v.status === 'MAINTENANCE').length,
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
            fetchVehicles();
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
            Fleet Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Manage your vehicles and track maintenance schedules
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
          Add Vehicle
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Fleet', value: stats.total, icon: Car, color: 'bg-slate-100 text-slate-600' },
          { label: 'Available', value: stats.available, icon: Check, color: 'bg-green-100 text-green-600' },
          { label: 'In Use', value: stats.inUse, icon: MapPin, color: 'bg-blue-100 text-blue-600' },
          { label: 'Maintenance', value: stats.maintenance, icon: Wrench, color: 'bg-orange-100 text-orange-600' },
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

      {/* Maintenance Alerts */}
      {stats.maintenance > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-orange-600" />
            <div>
              <h4 className="font-semibold text-orange-800 dark:text-orange-300">Maintenance Alerts</h4>
              <p className="text-sm text-orange-700 dark:text-orange-400">
                {stats.maintenance} vehicle{stats.maintenance > 1 ? 's' : ''} currently in maintenance
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <input
            type="text"
            placeholder="Search by make, model, or license plate..."
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
          <option value="IN_USE">In Use</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="RETIRED">Retired</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 focus:border-primary focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="SEDAN">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="VAN">Van</option>
          <option value="LUXURY">Luxury</option>
          <option value="MINIBUS">Minibus</option>
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">License</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {vehicles.map((vehicle) => {
                const status = statusConfig[vehicle.status];
                const type = typeConfig[vehicle.type];
                const StatusIcon = status.icon;

                return (
                  <tr
                    key={vehicle.id}
                    className={cn(
                      'hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer',
                      vehicle.status === 'RETIRED' && 'opacity-60'
                    )}
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDetailModal(true);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <Car className="size-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{vehicle.make}</p>
                          <p className="text-sm text-slate-500">{vehicle.model} ({vehicle.year})</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-medium', type.color)}>
                        {type.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-700 dark:text-slate-300">{vehicle.licensePlate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {vehicle.driver?.name || <span className="text-slate-400">Unassigned</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', status.style)}>
                        <StatusIcon className="size-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <Users className="size-4" />
                        <span className="text-sm">{vehicle.capacity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVehicle(vehicle);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(vehicle);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {vehicles.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <Car className="size-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No vehicles found</h3>
          <p className="text-slate-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {showDetailModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Car className="size-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm text-slate-500">{selectedVehicle.licensePlate}</span>
                      <span className={cn('inline-flex px-2 py-0.5 rounded text-xs font-medium', typeConfig[selectedVehicle.type].color)}>
                        {typeConfig[selectedVehicle.type].label}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              {/* Status & Driver */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border', statusConfig[selectedVehicle.status].style)}>
                    {statusConfig[selectedVehicle.status].label}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Assigned Driver</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {selectedVehicle.driver?.name || 'No driver assigned'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <Calendar className="size-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedVehicle.year}</p>
                  <p className="text-xs text-slate-500">Year</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <Users className="size-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedVehicle.capacity}</p>
                  <p className="text-xs text-slate-500">Capacity</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <Car className="size-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedVehicle._count?.bookings || 0}</p>
                  <p className="text-xs text-slate-500">Trips</p>
                </div>
              </div>

              {/* Features */}
              {selectedVehicle.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVehicle.features.map((feature) => (
                      <span key={feature} className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    openEditModal(selectedVehicle);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-yellow-400 transition-colors"
                >
                  <Edit className="size-4" />
                  Edit Vehicle
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

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add New Vehicle</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Make *</label>
                    <input
                      type="text"
                      required
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="e.g. Mercedes-Benz"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="e.g. V-Class"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year *</label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Plate *</label>
                    <input
                      type="text"
                      required
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                      placeholder="XX-000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option value="SEDAN">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="VAN">Van</option>
                      <option value="LUXURY">Luxury</option>
                      <option value="MINIBUS">Minibus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={20}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Features</label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={featureInput}
                      onChange={(e) => {
                        if (e.target.value) addFeature(e.target.value);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option value="">Select feature...</option>
                      {featureOptions.filter(f => !formData.features.includes(f)).map(feature => (
                        <option key={feature} value={feature}>{feature}</option>
                      ))}
                    </select>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map(feature => (
                        <span key={feature} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">
                          {feature}
                          <button type="button" onClick={() => removeFeature(feature)} className="text-slate-400 hover:text-red-500">
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ImageUpload
                  label="Vehicle Photo (Optional)"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url || null })}
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
                    Add Vehicle
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Vehicle</h3>
                <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleEditVehicle} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Make *</label>
                    <input
                      type="text"
                      required
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year *</label>
                    <input
                      type="number"
                      required
                      min={1990}
                      max={new Date().getFullYear() + 1}
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Plate *</label>
                    <input
                      type="text"
                      required
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option value="SEDAN">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="VAN">Van</option>
                      <option value="LUXURY">Luxury</option>
                      <option value="MINIBUS">Minibus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={20}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Features</label>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={featureInput}
                      onChange={(e) => {
                        if (e.target.value) addFeature(e.target.value);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                      <option value="">Select feature...</option>
                      {featureOptions.filter(f => !formData.features.includes(f)).map(feature => (
                        <option key={feature} value={feature}>{feature}</option>
                      ))}
                    </select>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map(feature => (
                        <span key={feature} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm">
                          {feature}
                          <button type="button" onClick={() => removeFeature(feature)} className="text-slate-400 hover:text-red-500">
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <ImageUpload
                  label="Vehicle Photo (Optional)"
                  value={formData.image || ''}
                  onChange={(url) => setFormData({ ...formData, image: url || null })}
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
      {showDeleteConfirm && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="size-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">Delete Vehicle</h3>
              <p className="text-center text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedVehicle.make} {selectedVehicle.model}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-semibold transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteVehicle}
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
