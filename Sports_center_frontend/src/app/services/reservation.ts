import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) {}

  createReservation(reservation: any) {
    return this.http.post(this.apiUrl, reservation);
  }

  getReservations() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getReservationsByClient(clientId: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/client/${clientId}`
    );
  }

  deleteReservation(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  hideReservationForClient(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/hide-for-client`, {});
  }
}