import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GroupClassService {

  private apiUrl = 'http://localhost:8080/api/group-classes';

  constructor(private http: HttpClient) {}

  createGroupClass(groupClass: any) {
    return this.http.post<any>(this.apiUrl, groupClass);
  }

  getCoachGroupClasses(coachId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/coach/${coachId}`);
  }

  getAvailableGroupClasses() {
    return this.http.get<any[]>(this.apiUrl);
  }

  participate(groupClassId: number, clientId: number) {
    return this.http.post<any>(
      `${this.apiUrl}/${groupClassId}/participate/${clientId}`,
      {}
    );
  }

  getParticipantsCount(groupClassId: number) {
    return this.http.get<number>(
      `${this.apiUrl}/${groupClassId}/participants/count`
    );
  }

  isParticipating(groupClassId: number, clientId: number) {
    return this.http.get<boolean>(
      `${this.apiUrl}/${groupClassId}/participating/${clientId}`
    );
  }

  cancelParticipation(groupClassId: number, clientId: number) {
    return this.http.delete(
      `${this.apiUrl}/${groupClassId}/participate/${clientId}`
    );
  }
}