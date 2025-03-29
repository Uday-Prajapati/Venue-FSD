import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VenueService } from '../../services/venue.service';
import { Venue } from '../../models/venue.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="hero-section slide-up">
      <h1 class="hero-title">Find Your Perfect Venue</h1>
      <p class="hero-subtitle">Discover and book amazing venues for your next event</p>
    </div>

    <div class="search-section container fade-in">
      <div class="row g-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Search venues by name or location..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="filterVenues()"
            >
          </div>
        </div>
        <div class="col-md-3">
          <select 
            class="form-select" 
            [(ngModel)]="selectedFilter"
            (ngModelChange)="filterVenues()"
          >
            <option value="">All Venues</option>
            <option value="Available">Available</option>
            <option value="Booked">Booked</option>
          </select>
        </div>
        <div class="col-md-3">
          <select 
            class="form-select"
            [(ngModel)]="capacityFilter"
            (ngModelChange)="filterVenues()"
          >
            <option value="">All Capacities</option>
            <option value="Small">Small Venues</option>
            <option value="Medium">Medium Venues</option>
            <option value="Large">Large Venues</option>
          </select>
        </div>
      </div>
    </div>

    <div class="venue-grid fade-in">
      <div class="venue-card card" *ngFor="let venue of filteredVenues">
        <img [src]="venue.imageUrl" class="card-img-top" [alt]="venue.name">
        <div class="card-body">
          <h5 class="card-title">{{ venue.name }}</h5>
          <p class="card-text text-muted">{{ venue.location }}</p>
          <div class="mb-3">
            <span class="badge me-2" [class]="venue.status === 'Available' ? 'bg-success' : 'bg-danger'">
              {{ venue.status }}
            </span>
            <span class="badge bg-info">{{ venue.capacityType }}</span>
          </div>
          <p class="card-text">{{ venue.description | slice:0:100 }}...</p>
          <a [routerLink]="['/venue', venue.id]" class="btn btn-primary mt-auto">
            View Details
          </a>
        </div>
      </div>
    </div>

    <div *ngIf="filteredVenues.length === 0" class="text-center py-5">
      <h3>No venues found</h3>
      <p class="text-muted">No venues found matching your search criteria.</p>
    </div>
  `
})
export class HomeComponent implements OnInit {
  venues: Venue[] = [];
  filteredVenues: Venue[] = [];
  searchTerm = '';
  selectedFilter = '';
  capacityFilter = '';

  constructor(private venueService: VenueService) {}

  ngOnInit(): void {
    this.venueService.getVenues().subscribe(venues => {
      this.venues = venues;
      this.filterVenues();
    });
  }

  filterVenues(): void {
    this.filteredVenues = this.venues.filter(venue => {
      const matchesSearch = 
        venue.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        venue.location.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        venue.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedFilter || venue.status === this.selectedFilter;
      const matchesCapacity = !this.capacityFilter || venue.capacityType === this.capacityFilter;

      return matchesSearch && matchesStatus && matchesCapacity;
    });

    if (this.filteredVenues.length === 0 && (this.searchTerm || this.selectedFilter || this.capacityFilter)) {
      Swal.fire({
        title: 'No Results',
        text: 'No venues found matching your search criteria.',
        icon: 'info'
      });
    }
  }
}