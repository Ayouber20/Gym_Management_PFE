import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CoachService {

  private apiUrl = 'http://localhost:8080/api/coaches';

  constructor(private http: HttpClient) {}

  getCoaches() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCoachByUserId(userId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/user/${userId}`
    );
  }

  createCoach(coach: any) {
    return this.http.post(this.apiUrl, coach);
  }
}