// booking.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { AuthService } from '../../services/auth.service';
import { Venue, Booking } from '../../models/venue.model';
import QRCode from 'qrcode';
import Swal from 'sweetalert2';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card" *ngIf="venue">
      <div class="card-body">
        <h2 class="card-title">Book {{ venue.name }}</h2>
        
        <div *ngIf="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>
        <div *ngIf="errorMessage" class="alert alert-danger">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" #bookingForm="ngForm" *ngIf="!bookingSubmitted">
          <div class="mb-3">
            <label for="eventName" class="form-label">Event Name</label>
            <input
              type="text"
              class="form-control"
              id="eventName"
              [(ngModel)]="booking.eventName"
              name="eventName"
              required
            >
          </div>

          <div class="mb-3">
            <label for="date" class="form-label">Date</label>
            <input
              type="date"
              class="form-control"
              id="date"
              [(ngModel)]="booking.date"
              name="date"
              required
              [min]="minDate"
              (change)="checkAvailability()"
            >
          </div>

          <div class="mb-3">
            <label for="time" class="form-label">Time</label>
            <input
              type="time"
              class="form-control"
              id="time"
              [(ngModel)]="booking.time"
              name="time"
              required
              (change)="checkAvailability()"
            >
          </div>

          <div class="mb-3">
            <label for="duration" class="form-label">Duration (hours)</label>
            <input
              type="number"
              class="form-control"
              id="duration"
              [(ngModel)]="booking.duration"
              name="duration"
              required
              min="1"
              (change)="checkAvailability()"
            >
          </div>

          <button type="submit" class="btn btn-primary" [disabled]="!bookingForm.form.valid || !isTimeSlotAvailable">
            Confirm Booking
          </button>
        </form>

        <div *ngIf="bookingSubmitted" class="booking-confirmation">
          <div class="alert" [class.alert-warning]="booking.status === 'Pending'" [class.alert-success]="booking.status === 'Approved'">
            <h4 *ngIf="booking.status === 'Pending'">Booking Request Sent!</h4>
            <h4 *ngIf="booking.status === 'Approved'">Booking Confirmed!</h4>
            <p>Your booking for {{ booking.eventName }} at {{ venue.name }} is <strong>{{ (booking.status || 'Pending').toLowerCase() }}</strong>.</p>
            <p *ngIf="booking.status === 'Pending'">Please wait for admin confirmation.</p>
          </div>

          <div *ngIf="qrCodeUrl" class="mt-4 text-center">
            <h4>Booking QR Code</h4>
            <img [src]="qrCodeUrl" alt="Booking QR Code" class="img-fluid">
            <p class="mt-2">Show this QR code at the venue for check-in.</p>
          </div>

          <button class="btn btn-secondary mt-3" (click)="goBackToVenue()">
            Back to Venue
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-confirmation {
      text-align: center;
    }
    .img-fluid {
      max-width: 200px;
      height: auto;
    }
  `]
})
export class BookingComponent implements OnInit {
  venue: Venue | undefined;
  booking: Booking = {
    id: '',
    venueId: '',
    userId: '',
    eventName: '',
    date: '',
    time: '',
    duration: 1,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    qrCode: ''
  };
  qrCodeUrl = '';
  bookingSubmitted = false;
  successMessage = '';
  errorMessage = '';
  isTimeSlotAvailable = true;
  minDate: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    private authService: AuthService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    const venueId = this.route.snapshot.paramMap.get('venueId');
    if (venueId) {
      this.venue = this.venueService.getVenueById(venueId);
      if (!this.venue) {
        this.errorMessage = 'Venue not found';
      }
    }
  }

  checkAvailability(): void {
    if (!this.venue || !this.booking.date || !this.booking.time || !this.booking.duration) {
      return;
    }

    const isAvailable = this.venueService.checkAvailability(
      this.venue.id,
      this.booking.date,
      this.booking.time,
      this.booking.duration
    );

    this.isTimeSlotAvailable = isAvailable;
    
    if (!isAvailable) {
      this.errorMessage = 'Selected date/time is unavailable. Please choose another time slot.';
    } else {
      this.errorMessage = '';
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.venue || !this.isTimeSlotAvailable) {
      this.errorMessage = 'Please complete all fields and ensure the time slot is available';
      return;
    }

    const user = await firstValueFrom(this.authService.currentUser$);
    if (!user) {
      this.errorMessage = 'You must be logged in to make a booking';
      return;
    }

    const newBooking: Booking = {
      id: crypto.randomUUID(),
      venueId: this.venue.id,
      userId: user.id,
      eventName: this.booking.eventName!,
      date: this.booking.date!,
      time: this.booking.time!,
      duration: this.booking.duration!,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      qrCode: ''
    };

    try {
      // Generate QR code
      this.qrCodeUrl = await QRCode.toDataURL(JSON.stringify(newBooking));
      newBooking.qrCode = this.qrCodeUrl;
      
      // Save booking
      this.venueService.addBooking(newBooking);
      
      // Update venue availability
      this.venueService.markVenueAsBooked(
        this.venue.id,
        this.booking.date!,
        this.booking.time!,
        this.booking.duration!
      );
      
      // Update local booking reference
      this.booking = newBooking;
      this.bookingSubmitted = true;
      
      Swal.fire({
        title: 'Success!',
        text: 'Booking request sent to admin for approval',
        icon: 'success'
      });
      
    } catch (err) {
      console.error('Error during booking:', err);
      this.errorMessage = 'An error occurred during booking. Please try again.';
      Swal.fire({
        title: 'Error!',
        text: 'Booking failed. Please try again.',
        icon: 'error'
      });
    }
  }

  goBackToVenue(): void {
    if (this.venue) {
      this.router.navigate(['/venue', this.venue.id]);
    }
  }
}