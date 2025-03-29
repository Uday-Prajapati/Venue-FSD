// src/app/models/venue.model.ts

/**
 * Represents a booking slot for a venue
 */
export interface VenueBookingSlot {
  date: string;
  time: string;
  duration: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
}

/**
 * Represents a venue location
 */
export interface VenueLocation {
  lat: number;
  lng: number;
}

/**
 * Represents a venue with all its properties
 */
export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  capacityType: 'Small' | 'Medium' | 'Large';
  imageUrl: string;
  status: 'Available' | 'Booked' | 'Maintenance';
  description: string;
  mapLocation: VenueLocation;
  bookings?: VenueBookingSlot[];
}

/**
 * Represents a booking made by a user
 */
export interface Booking {
  id: string;
  venueId: string;
  userId: string;
  eventName: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:MM (24-hour)
  duration: number; // in hours
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  qrCode?: string; // Base64 encoded QR code image
  createdAt: string; // ISO date string
}

/**
 * Represents a user of the system
 */
export interface User {
  id: string;
  email: string;
  password: string;
  role: 'Admin' | 'User';
  name: string;
  bookings?: string[]; // Array of booking IDs
}

/**
 * Represents the response format for API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Represents a time slot for booking availability checks
 */
export interface TimeSlot {
  start: string; // Format: HH:MM
  end: string;   // Format: HH:MM
  available: boolean;
}

/**
 * Represents a venue with its availability for a specific date
 */
export interface VenueAvailability {
  venue: Venue;
  date: string;
  availableSlots: TimeSlot[];
}