import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { City } from '../model/city';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getCity(title: string): Observable<City> {
    return this.http.get<City>(this.baseUrl + '/api/' + title);
  }

  updateCity(
    originCityId: string,
    destinationCityId: string
  ): Observable<City> {
    return this.http.patch<City>(this.baseUrl + '/api/' + originCityId, {
      destination: destinationCityId,
    });
  }
}
