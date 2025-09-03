import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export interface MapboxGeocodeResponse {
  features: {
    center: [number, number];
    place_name: string;
    geometry: {
      coordinates: [number, number];
    };
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private mapboxAccessToken = '';
  private mapboxBaseUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';

  constructor(private http: HttpClient) {}

  /**
   * Geocode an address using Mapbox Geocoding API
   * @param address - The address to geocode
   * @returns Observable<GeocodeResult | null>
   */
  geocodeAddress(address: string): Observable<GeocodeResult | null> {
    if (!address || address.trim().length === 0) {
      return new Observable(observer => {
        observer.next(null);
        observer.complete();
      });
    }

    const encodedAddress = encodeURIComponent(address.trim());
    const url = `${this.mapboxBaseUrl}/${encodedAddress}.json?access_token=${this.mapboxAccessToken}&limit=1&country=IN`;

    return this.http.get<MapboxGeocodeResponse>(url).pipe(
      map(response => {
        if (response.features && response.features.length > 0) {
          const feature = response.features[0];
          return {
            latitude: feature.center[1],
            longitude: feature.center[0],
            formattedAddress: feature.place_name
          };
        }
        return null;
      })
    );
  }

  /**
   * Reverse geocode coordinates to get address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Observable<string | null>
   */
  reverseGeocode(latitude: number, longitude: number): Observable<string | null> {
    const url = `${this.mapboxBaseUrl}/${longitude},${latitude}.json?access_token=${this.mapboxAccessToken}&limit=1`;

    return this.http.get<MapboxGeocodeResponse>(url).pipe(
      map(response => {
        if (response.features && response.features.length > 0) {
          return response.features[0].place_name;
        }
        return null;
      })
    );
  }
}