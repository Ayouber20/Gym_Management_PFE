import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  private apiUrl = 'http://localhost:8080/api/clients';

  constructor(private http: HttpClient) {}

  getClients() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getClientByUserId(userId: number) {
    return this.http.get<any>(
      `${this.apiUrl}/user/${userId}`
    );
  }

  createClient(client: any) {
    return this.http.post(this.apiUrl, client);
  }
}