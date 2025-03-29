import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VenueService } from '../../services/venue.service';
import { AuthService } from '../../services/auth.service';
import { Venue, Booking, User } from '../../models/venue.model';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-venue-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" *ngIf="venue">
      <img [src]="venue.imageUrl" class="card-img-top" alt="{{ venue.name }}">
      <div class="card-body">
        <h2 class="card-title">{{ venue.name }}</h2>
        <p class="card-text">{{ venue.description }}</p>
        
        <div class="row mb-4">
          <div class="col-md-6">
            <h4>Location</h4>
            <p>{{ venue.location }}</p>
          </div>
          <div class="col-md-6">
            <h4>Capacity</h4>
            <p>{{ venue.capacity }} ({{ venue.capacityType }})</p>
          </div>
        </div>

        <div class="mb-4">
          <h4>Status</h4>
          <span [class]="'badge ' + (venue.status === 'Available' ? 'bg-success' : 'bg-danger')">
            {{ venue.status }}
          </span>
        </div>

        <div *ngIf="userBooking" class="alert" [class.alert-danger]="userBooking.status === 'Pending'" [class.alert-success]="userBooking.status === 'Approved'">
          <strong *ngIf="userBooking.status === 'Pending'">Pending Confirmation</strong>
          <strong *ngIf="userBooking.status === 'Approved'">Booking Confirmed</strong>
          <p>Event: {{ userBooking.eventName }}</p>
          <p>Date: {{ userBooking.date }} at {{ userBooking.time }}</p>
          
          <!-- QR Code Section for Approved Bookings -->
          <div *ngIf="userBooking.status === 'Approved' && userBooking.qrCode" class="mt-3">
            <h5>Your Booking QR Code</h5>
            <img [src]="userBooking.qrCode" alt="Booking QR Code" class="qr-code">
            <p class="mt-2">Show this QR code at the venue for check-in.</p>
          </div>
        </div>
        <div *ngIf="(venue.status === 'Available' ) ">
  <button class="btn btn-primary" (click)="bookVenue()">Book Now</button>
</div>

        <div *ngIf="bookings.length > 0" class="mt-4">
          <h4>Upcoming Bookings</h4>
          <ul class="list-group">
            <li class="list-group-item" *ngFor="let booking of bookings">
              <div class="d-flex align-items-center">
                <div>
                  {{ booking.eventName }} - {{ booking.date }} at {{ booking.time }}
                  <span [class]="'badge ms-2 ' + getStatusClass(booking.status)">
                    {{ booking.status }}
                  </span>
                </div>
                <!-- QR Code for Approved Bookings -->
                <div *ngIf="booking.status === 'Approved' && booking.qrCode" class="ms-3">
                  <img [src]="booking.qrCode" alt="Booking QR Code" class="qr-code-small">
                  <small class="d-block text-muted">Show at check-in</small>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 0.5em 0.75em;
      font-size: 0.875em;
    }
    .list-group-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .qr-code {
      max-width: 200px;
      height: auto;
      margin: 1rem auto;
      display: block;
    }
    .qr-code-small {
      max-width: 100px;
      height: auto;
      display: block;
    }
  `]
})
export class VenueDetailsComponent implements OnInit {
  venue: Venue | undefined;
  bookings: Booking[] = [];
  userBooking: Booking | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private venueService: VenueService,
    public authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const venueId = this.route.snapshot.paramMap.get('id');
    if (venueId) {
      this.venue = this.venueService.getVenueById(venueId);
      
      try {
        const bookings = await this.venueService.getBookings().pipe(take(1)).toPromise();
        if (bookings) {
          this.bookings = bookings.filter(b => b.venueId === venueId);
          
          const user = await this.authService.currentUser$.pipe(take(1)).toPromise() as User | null;
          if (user) {
            this.userBooking = bookings.find(b => 
              b.venueId === venueId && 
              b.userId === user.id
            ) || null;
          }
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load booking information',
          icon: 'error'
        });
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Approved': return 'bg-success';
      case 'Rejected': return 'bg-danger';
      case 'Pending': return 'bg-warning';
      case 'Cancelled': return 'bg-secondary';
      default: return 'bg-primary';
    }
  }

  bookVenue(): void {
    if (this.venue) {
      this.router.navigate(['/booking', this.venue.id]);
    }
  }
}