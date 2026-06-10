import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CoachRequestService {

  private apiUrl = 'http://localhost:8080/api/coach-requests';

  constructor(private http: HttpClient) {}

  createRequest(request: any) {
    return this.http.post(this.apiUrl, request);
  }

  getRequests() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getRequestsByClient(clientId: number) {
    return this.http.get<any[]>(
      `${this.apiUrl}/client/${clientId}`
    );
  }

  acceptRequest(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/accept`, {});
  }

  rejectRequest(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }
}