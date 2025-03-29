import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Venue, Booking, VenueBookingSlot } from '../models/venue.model';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private venues = new BehaviorSubject<Venue[]>([]);
  private bookings = new BehaviorSubject<Booking[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const venuesData = localStorage.getItem('venues');
    const bookingsData = localStorage.getItem('bookings');

    if (!venuesData) {
      const sampleVenues: Venue[] = [
        {
          id: '1',
          name: 'Grand Ballroom',
          location: 'Downtown City Center',
          capacity: 500,
          capacityType: 'Large',
          imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          status: 'Available',
          description: 'Luxurious ballroom perfect for weddings and large corporate events.',
          mapLocation: { lat: 40.7128, lng: -74.0060 },
          bookings: []
        },
        {
          id: '2',
          name: 'Garden Terrace',
          location: 'Botanical Gardens',
          capacity: 150,
          capacityType: 'Medium',
          imageUrl: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          status: 'Available',
          description: 'Beautiful outdoor venue surrounded by nature.',
          mapLocation: { lat: 40.7829, lng: -73.9654 },
          bookings: []
        },
        {
          id: '3',
          name: 'Conference Center',
          location: 'Business District',
          capacity: 50,
          capacityType: 'Small',
          imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
          status: 'Available',
          description: 'Modern meeting space equipped with latest technology.',
          mapLocation: { lat: 40.7549, lng: -73.9840 },
          bookings: []
        }
      ];
      localStorage.setItem('venues', JSON.stringify(sampleVenues));
      this.venues.next(sampleVenues);
    } else {
      this.venues.next(JSON.parse(venuesData));
    }

    if (bookingsData) {
      this.bookings.next(JSON.parse(bookingsData));
    } else {
      localStorage.setItem('bookings', JSON.stringify([]));
      this.bookings.next([]);
    }
  }

  // Venue-related methods
  getVenues(): Observable<Venue[]> {
    return this.venues.asObservable();
  }

  getVenueById(id: string): Venue | undefined {
    return this.venues.value.find(venue => venue.id === id);
  }

  addVenue(venue: Partial<Venue>): void {
    if (!this.validateVenueData(venue)) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill all required fields.',
        icon: 'error'
      });
      return;
    }

    const newVenue = {
      ...venue,
      id: crypto.randomUUID(),
      bookings: []
    } as Venue;

    const currentVenues = this.venues.value;
    currentVenues.push(newVenue);
    this.venues.next(currentVenues);
    localStorage.setItem('venues', JSON.stringify(currentVenues));
    
    Swal.fire({
      title: 'Success!',
      text: 'New Venue Added Successfully!',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  updateVenue(venue: Venue): void {
    if (!this.validateVenueData(venue)) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill all required fields.',
        icon: 'error'
      });
      return;
    }

    const currentVenues = this.venues.value;
    const index = currentVenues.findIndex(v => v.id === venue.id);
    if (index !== -1) {
      currentVenues[index] = venue;
      this.venues.next(currentVenues);
      localStorage.setItem('venues', JSON.stringify(currentVenues));
      
      Swal.fire({
        title: 'Success!',
        text: 'Venue Details Updated Successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  renameVenue(id: string, newName: string): void {
    const currentVenues = this.venues.value;
    const venue = currentVenues.find(v => v.id === id);
    
    if (venue) {
      venue.name = newName;
      this.venues.next(currentVenues);
      localStorage.setItem('venues', JSON.stringify(currentVenues));
      
      Swal.fire({
        title: 'Success!',
        text: 'Venue Renamed Successfully!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  deleteVenue(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const currentVenues = this.venues.value.filter(venue => venue.id !== id);
        this.venues.next(currentVenues);
        localStorage.setItem('venues', JSON.stringify(currentVenues));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Venue Deleted Successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  updateVenueStatus(venue: Venue, status: 'Available' | 'Booked'): void {
    const currentVenues = this.venues.value;
    const index = currentVenues.findIndex(v => v.id === venue.id);
    if (index !== -1) {
      currentVenues[index].status = status;
      this.venues.next(currentVenues);
      localStorage.setItem('venues', JSON.stringify(currentVenues));
    }
  }

  // Booking-related methods
  getBookings(): Observable<Booking[]> {
    return this.bookings.asObservable();
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.value.find(booking => booking.id === id);
  }

  getBookingsByVenueId(venueId: string): Booking[] {
    return this.bookings.value.filter(booking => booking.venueId === venueId);
  }

  getBookingsByUserId(userId: string): Booking[] {
    return this.bookings.value.filter(booking => booking.userId === userId);
  }

  addBooking(booking: Partial<Booking>): void {
    if (!this.validateBookingData(booking)) {
      Swal.fire({
        title: 'Error!',
        text: 'Please fill all fields before submitting.',
        icon: 'error'
      });
      return;
    }

    if (!this.checkAvailability(booking.venueId!, booking.date!, booking.time!, booking.duration!)) {
      Swal.fire({
        title: 'Error!',
        text: 'Selected date/time is unavailable. Please choose a different slot.',
        icon: 'error'
      });
      return;
    }

    const newBooking = {
      ...booking,
      id: crypto.randomUUID(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    } as Booking;

    const currentBookings = this.bookings.value;
    currentBookings.push(newBooking);
    this.bookings.next(currentBookings);
    localStorage.setItem('bookings', JSON.stringify(currentBookings));

    this.markVenueAsBooked(
      newBooking.venueId,
      newBooking.date,
      newBooking.time,
      newBooking.duration
    );
  }

  updateBookingStatus(bookingId: string, status: 'Approved' | 'Rejected' | 'Cancelled'): void {
    const currentBookings = this.bookings.value;
    const bookingIndex = currentBookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
      if (this.isBookingPast(currentBookings[bookingIndex])) {
        Swal.fire({
          title: 'Error!',
          text: 'This booking cannot be modified as the event date has passed.',
          icon: 'error'
        });
        return;
      }

      currentBookings[bookingIndex].status = status;
      this.bookings.next(currentBookings);
      localStorage.setItem('bookings', JSON.stringify(currentBookings));

      // Update venue status if needed
      const venue = this.getVenueById(currentBookings[bookingIndex].venueId);
      if (venue) {
        const hasOtherApprovedBookings = this.bookings.value.some(b => 
          b.venueId === venue.id && 
          b.status === 'Approved' && 
          b.id !== bookingId
        );
        
        if (status === 'Rejected' || status === 'Cancelled') {
          if (!hasOtherApprovedBookings) {
            venue.status = 'Available';
            this.updateVenue(venue);
          }
        } else if (status === 'Approved') {
          venue.status = 'Booked';
          this.updateVenue(venue);
        }
      }
    }
  }

  checkAvailability(venueId: string, date: string, time: string, duration: number): boolean {
    const venue = this.getVenueById(venueId);
    if (!venue) return false;

    const [hours, minutes] = time.split(':').map(Number);
    const startTime = hours * 60 + minutes;
    const endTime = startTime + duration * 60;

    const conflictingBookings = this.bookings.value.filter(booking => {
      if (booking.venueId !== venueId || booking.date !== date || 
          booking.status === 'Cancelled' || booking.status === 'Rejected') {
        return false;
      }

      const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number);
      const bookingStart = bookingHours * 60 + bookingMinutes;
      const bookingEnd = bookingStart + booking.duration * 60;

      return (startTime < bookingEnd) && (endTime > bookingStart);
    });

    return conflictingBookings.length === 0;
  }

  markVenueAsBooked(venueId: string, date: string, time: string, duration: number): void {
    const venues = this.venues.value;
    const venueIndex = venues.findIndex(v => v.id === venueId);
    
    if (venueIndex !== -1) {
      const venue = venues[venueIndex];
      
      if (!venue.bookings) {
        venue.bookings = [];
      }
      
      venue.bookings.push({
        date,
        time,
        duration,
        status: 'Pending'
      });
      
      if (venue.status === 'Available') {
        venue.status = 'Booked';
      }
      
      this.venues.next(venues);
      localStorage.setItem('venues', JSON.stringify(venues));
    }
  }

  // Helper methods
  private validateVenueData(venue: Partial<Venue>): boolean {
    return !!(venue.name && venue.location && venue.capacity && 
             venue.capacityType && venue.imageUrl && venue.description);
  }

  private validateBookingData(booking: Partial<Booking>): boolean {
    return !!(booking.eventName && booking.date && booking.time && 
             booking.duration && booking.venueId && booking.userId);
  }

  private isBookingPast(booking: Booking): boolean {
    const eventDate = new Date(`${booking.date}T${booking.time}`);
    return eventDate < new Date();
  }

  isVenueAvailable(venueId: string, date: string, time: string): boolean {
    const existingBooking = this.bookings.value.find(b => 
      b.venueId === venueId && 
      b.date === date && 
      b.time === time &&
      b.status !== 'Cancelled' &&
      b.status !== 'Rejected'
    );
    return !existingBooking;
  }
}