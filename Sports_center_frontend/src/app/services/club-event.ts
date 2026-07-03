import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClubEventService {

  private apiUrl = 'http://localhost:8080/api/events';

  constructor(private http: HttpClient) {}

  createEvent(event: any) {
    return this.http.post<any>(this.apiUrl, event);
  }

  getAllEvents() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getClientEvents() {
    return this.http.get<any[]>(`${this.apiUrl}/client`);
  }

  getCoachEvents() {
    return this.http.get<any[]>(`${this.apiUrl}/coach`);
  }

  participate(eventId: number, participantRole: string, participantId: number) {
    return this.http.post<any>(
      `${this.apiUrl}/${eventId}/participate/${participantRole}/${participantId}`,
      {}
    );
  }

  cancelParticipation(eventId: number, participantRole: string, participantId: number) {
    return this.http.delete(
      `${this.apiUrl}/${eventId}/participate/${participantRole}/${participantId}`
    );
  }

  isParticipating(eventId: number, participantRole: string, participantId: number) {
    return this.http.get<boolean>(
      `${this.apiUrl}/${eventId}/participating/${participantRole}/${participantId}`
    );
  }

  getParticipantsCount(eventId: number) {
    return this.http.get<number>(
      `${this.apiUrl}/${eventId}/participants/count`
    );
  }

  disableEvent(eventId: number) {
    return this.http.put<any>(`${this.apiUrl}/${eventId}/disable`, {});
  }

  activateEvent(eventId: number) {
    return this.http.put<any>(`${this.apiUrl}/${eventId}/activate`, {});
  }

  deleteEvent(eventId: number) {
    return this.http.delete(`${this.apiUrl}/${eventId}`);
  }
}