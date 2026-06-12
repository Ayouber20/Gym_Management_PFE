import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:8080/api/notifications';

  constructor(private http: HttpClient) {}

  getClientNotifications(clientId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getCoachNotifications(coachId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/coach/${coachId}`);
  }

  getAdminNotifications() {
    return this.http.get<any[]>(`${this.apiUrl}/admin`);
  }
}