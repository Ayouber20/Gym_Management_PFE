import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = 'http://localhost:8080/api/announcements';

  constructor(private http: HttpClient) {}

  createAnnouncement(announcement: any) {
    return this.http.post(this.apiUrl, announcement);
  }

  getAllAnnouncements() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getClientAnnouncements() {
    return this.http.get<any[]>(`${this.apiUrl}/client`);
  }

  getCoachAnnouncements() {
    return this.http.get<any[]>(`${this.apiUrl}/coach`);
  }

  disableAnnouncement(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/disable`, {});
  }
}