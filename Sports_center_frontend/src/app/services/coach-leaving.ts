import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CoachLeavingService {

  private apiUrl = 'http://localhost:8080/api/coach-leaves';

  constructor(private http: HttpClient) {}

  getAllLeaves() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getLeavesByCoach(coachId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/coach/${coachId}`);
  }

  createLeaveRequest(leaveRequest: any) {
    return this.http.post<any>(this.apiUrl, leaveRequest);
  }

  acceptLeaveRequest(id: number) {
    return this.http.put<any>(`${this.apiUrl}/${id}/accept`, {});
  }

  rejectLeaveRequest(id: number) {
    return this.http.put<any>(`${this.apiUrl}/${id}/reject`, {});
  }
}