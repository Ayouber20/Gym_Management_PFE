import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourtService {

  private apiUrl = 'http://localhost:8080/api/courts';

  constructor(private http: HttpClient) {}

  getCourts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  setMaintenance(
    id: number,
    maintenanceStartDate: string,
    maintenanceEndDate: string
  ) {
    return this.http.put(`${this.apiUrl}/${id}/maintenance`, {
      maintenanceStartDate,
      maintenanceEndDate
    });
  }

  setAvailable(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/available`, {});
  }
}