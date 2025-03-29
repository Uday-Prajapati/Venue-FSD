import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../../services/venue.service';
import { Venue, Booking } from '../../models/venue.model';
import Swal from 'sweetalert2';
import { ShortenIdPipe } from '../../pipes/shorten-id.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ShortenIdPipe],
  template: `
    <div class="admin-dashboard">
      <div class="row mb-4">
        <div class="col">
          <h2>Venue Management</h2>
          <button class="btn btn-primary" (click)="showAddVenueForm = true">Add New Venue</button>
        </div>
      </div>

      <div class="card mb-4" *ngIf="showAddVenueForm">
        <div class="card-body">
          <h3>{{ editingVenue ? 'Edit' : 'Add' }} Venue</h3>
          <form (ngSubmit)="onSubmitVenue()">
            <div class="mb-3">
              <label for="name" class="form-label">Name</label>
              <input
                type="text"
                class="form-control"
                id="name"
                [(ngModel)]="newVenue.name"
                name="name"
                required
              >
            </div>

            <div class="mb-3">
              <label for="location" class="form-label">Location</label>
              <input
                type="text"
                class="form-control"
                id="location"
                [(ngModel)]="newVenue.location"
                name="location"
                required
              >
            </div>

            <div class="mb-3">
              <label for="capacity" class="form-label">Capacity</label>
              <input
                type="number"
                class="form-control"
                id="capacity"
                [(ngModel)]="newVenue.capacity"
                name="capacity"
                required
              >
            </div>

            <div class="mb-3">
              <label for="capacityType" class="form-label">Capacity Type</label>
              <select
                class="form-select"
                id="capacityType"
                [(ngModel)]="newVenue.capacityType"
                name="capacityType"
                required
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>

            <div class="mb-3">
              <label for="imageUrl" class="form-label">Image URL</label>
              <input
                type="url"
                class="form-control"
                id="imageUrl"
                [(ngModel)]="newVenue.imageUrl"
                name="imageUrl"
                required
              >
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">Description</label>
              <textarea
                class="form-control"
                id="description"
                [(ngModel)]="newVenue.description"
                name="description"
                required
                rows="3"
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Status</label>
              <div class="btn-group w-100">
                <button 
                  type="button" 
                  class="btn" 
                  [class.btn-success]="newVenue.status === 'Available'"
                  [class.btn-outline-success]="newVenue.status !== 'Available'"
                  (click)="newVenue.status = 'Available'"
                >
                  Available
                </button>
                <button 
                  type="button" 
                  class="btn" 
                  [class.btn-danger]="newVenue.status === 'Booked'"
                  [class.btn-outline-danger]="newVenue.status !== 'Booked'"
                  (click)="newVenue.status = 'Booked'"
                >
                  Booked
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary">{{ editingVenue ? 'Update' : 'Add' }} Venue</button>
            <button type="button" class="btn btn-secondary ms-2" (click)="cancelVenueForm()">Cancel</button>
          </form>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let venue of venues">
              <td>{{ venue.name }}</td>
              <td>{{ venue.location }}</td>
              <td>{{ venue.capacity }} ({{ venue.capacityType }})</td>
              <td>
                <div class="btn-group">
                  <button 
                    class="btn btn-sm" 
                    [class.btn-success]="venue.status === 'Available'"
                    [class.btn-outline-success]="venue.status !== 'Available'"
                    (click)="updateVenueStatus(venue, 'Available')"
                  >
                    Available
                  </button>
                  <button 
                    class="btn btn-sm" 
                    [class.btn-danger]="venue.status === 'Booked'"
                    [class.btn-outline-danger]="venue.status !== 'Booked'"
                    (click)="updateVenueStatus(venue, 'Booked')"
                  >
                    Booked
                  </button>
                </div>
              </td>
              <td>
                <button class="btn btn-sm btn-primary me-2" (click)="editVenue(venue)">Edit</button>
                <button class="btn btn-sm btn-info me-2" (click)="renameVenue(venue)">Rename</button>
                <button class="btn btn-sm btn-danger" (click)="deleteVenue(venue.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 class="mt-5">Booking Management</h2>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Venue</th>
              <th>Date</th>
              <th>Time</th>
              <th>Duration</th>
              <th>User</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let booking of bookings">
              <td>{{ booking.eventName }}</td>
              <td>{{ getVenueName(booking.venueId) }}</td>
              <td>{{ booking.date | date:'mediumDate' }}</td>
              <td>{{ booking.time }}</td>
              <td>{{ booking.duration }} hours</td>
              <td>{{ booking.userId | shortenId }}</td>
              <td>
                <span [class]="'badge ' + getStatusClass(booking.status)">
                  {{ booking.status }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn-sm btn-success me-2" 
                  *ngIf="booking.status === 'Pending'"
                  (click)="confirmBooking(booking.id)"
                >
                  Confirm
                </button>
                <button 
                  class="btn btn-sm btn-danger me-2" 
                  *ngIf="booking.status === 'Pending'"
                  (click)="rejectBooking(booking.id)"
                >
                  Reject
                </button>
                <button 
                  class="btn btn-sm btn-warning" 
                  *ngIf="booking.status === 'Approved'"
                  (click)="cancelBooking(booking.id)"
                >
                  Cancel
                </button>
                <button 
                  class="btn btn-sm btn-info" 
                  *ngIf="booking.qrCode"
                  (click)="showQRCode(booking)"
                >
                  View QR
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 0.5em 0.75em;
      font-size: 0.875em;
    }
    .btn-group .btn {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  venues: Venue[] = [];
  bookings: Booking[] = [];
  showAddVenueForm = false;
  editingVenue: string | null = null;
  newVenue: Partial<Venue> = {
    name: '',
    location: '',
    capacity: 0,
    capacityType: 'Small',
    imageUrl: '',
    status: 'Available',
    description: ''
  };

  constructor(private venueService: VenueService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.venueService.getVenues().subscribe(venues => this.venues = venues);
    this.venueService.getBookings().subscribe(bookings => {
      this.bookings = bookings.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
  }

  onSubmitVenue(): void {
    if (this.editingVenue) {
      this.venueService.updateVenue({
        ...this.newVenue,
        id: this.editingVenue
      } as Venue);
    } else {
      this.venueService.addVenue(this.newVenue);
    }
    this.cancelVenueForm();
  }

  editVenue(venue: Venue): void {
    this.editingVenue = venue.id;
    this.newVenue = { ...venue };
    this.showAddVenueForm = true;
  }

  renameVenue(venue: Venue): void {
    Swal.fire({
      title: 'Rename Venue',
      input: 'text',
      inputValue: venue.name,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Please enter a name!';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.venueService.renameVenue(venue.id, result.value);
      }
    });
  }

  deleteVenue(id: string): void {
    this.venueService.deleteVenue(id);
  }

  updateVenueStatus(venue: Venue, status: 'Available' | 'Booked'): void {
    this.venueService.updateVenue({
      ...venue,
      status
    });
  }

  cancelVenueForm(): void {
    this.showAddVenueForm = false;
    this.editingVenue = null;
    this.newVenue = {
      name: '',
      location: '',
      capacity: 0,
      capacityType: 'Small',
      imageUrl: '',
      status: 'Available',
      description: ''
    };
  }

  getVenueName(venueId: string): string {
    return this.venues.find(v => v.id === venueId)?.name || 'Unknown Venue';
  }

  confirmBooking(bookingId: string): void {
    Swal.fire({
      title: 'Confirm Booking',
      text: 'Are you sure you want to approve this booking?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, approve',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.venueService.updateBookingStatus(bookingId, 'Approved');
        Swal.fire('Confirmed!', 'The booking has been approved.', 'success');
      }
    });
  }

  rejectBooking(bookingId: string): void {
    Swal.fire({
      title: 'Reject Booking',
      text: 'Are you sure you want to reject this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.venueService.updateBookingStatus(bookingId, 'Rejected');
        Swal.fire('Rejected!', 'The booking has been rejected.', 'info');
      }
    });
  }

  cancelBooking(bookingId: string): void {
    Swal.fire({
      title: 'Cancel Booking',
      text: 'Are you sure you want to cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.venueService.updateBookingStatus(bookingId, 'Cancelled');
        Swal.fire('Cancelled!', 'The booking has been cancelled.', 'warning');
      }
    });
  }

  showQRCode(booking: Booking): void {
    if (booking.qrCode) {
      Swal.fire({
        title: 'Booking QR Code',
        imageUrl: booking.qrCode,
        imageAlt: 'Booking QR Code',
        showConfirmButton: true,
        confirmButtonText: 'Close'
      });
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
}