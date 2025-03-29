import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/venue.model';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    this.checkSession();
  }

  private checkSession(): void {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  // Add this method to get current user synchronously
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): void {
    if (!email || !password) {
      Swal.fire({
        title: 'Error!',
        text: 'Please enter both username and password.',
        icon: 'error'
      });
      return;
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.currentUserSubject.next(user);
      
      Swal.fire({
        title: 'Success!',
        text: 'Login Successful! Redirecting...',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate([user.role === 'Admin' ? '/admin' : '/']);
      });
    } else {
      Swal.fire({
        title: 'Error!',
        text: 'Invalid Username or Password!',
        icon: 'error'
      });
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    
    Swal.fire({
      title: 'Success!',
      text: 'You have logged out successfully!',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  checkSessionValidity(): void {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      Swal.fire({
        title: 'Error!',
        text: 'Session Expired! Please log in again.',
        icon: 'error'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === 'Admin';
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem('users');
    if (!usersStr) {
      const defaultUsers: User[] = [
        {
          id: '1',
          email: 'admin@example.com',
          password: 'admin123',
          role: 'Admin',
          name: 'Admin User'
        },
        {
          id: '2',
          email: 'user@example.com',
          password: 'user123',
          role: 'User',
          name: 'Regular User'
        }
      ];
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(usersStr);
  }

  // Optional: Add user registration functionality
  register(user: Omit<User, 'id'>): boolean {
    const users = this.getUsers();
    if (users.some(u => u.email === user.email)) {
      Swal.fire({
        title: 'Error!',
        text: 'Email already exists!',
        icon: 'error'
      });
      return false;
    }

    const newUser: User = {
      ...user,
      id: crypto.randomUUID()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    Swal.fire({
      title: 'Success!',
      text: 'Registration successful! Please login.',
      icon: 'success'
    });
    return true;
  }
}