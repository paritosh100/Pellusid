import { NextRequest, NextResponse } from 'next/server';

/**
 * Geocoding API endpoint using Photon by Komoot
 * Free, open-source geocoding based on OpenStreetMap data
 */

interface PhotonFeature {
    properties: {
        name?: string;
        city?: string;
        state?: string;
        country?: string;
        countrycode?: string;
        osm_value?: string;
    };
}

interface PhotonResponse {
    features: PhotonFeature[];
}

export interface CityResult {
    city: string;
    state?: string;
    country: string;
    countryCode: string;
    formatted: string;
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ results: [] });
        }

        // Call Photon API
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=15`;
        const response = await fetch(photonUrl);

        if (!response.ok) {
            throw new Error('Geocoding service unavailable');
        }

        const data: PhotonResponse = await response.json();

        // Transform and filter results
        const results: CityResult[] = data.features
            .filter((feature) => {
                // Only include cities, towns, and villages
                const osmValue = feature.properties.osm_value;
                return osmValue === 'city' || osmValue === 'town' || osmValue === 'village';
            })
            .map((feature) => {
                const props = feature.properties;
                const city = props.city || props.name || '';
                const state = props.state || '';
                const country = props.country || '';
                const countryCode = props.countrycode?.toUpperCase() || '';

                // Format: "City, State, Country" or "City, Country" if no state
                let formatted = city;
                if (state) {
                    formatted += `, ${state}`;
                }
                if (countryCode) {
                    formatted += `, ${countryCode}`;
                } else if (country) {
                    formatted += `, ${country}`;
                }

                return {
                    city,
                    state,
                    country,
                    countryCode,
                    formatted,
                };
            })
            .filter((result) => result.city && result.formatted)
            // Remove duplicates based on formatted string
            .filter((result, index, self) =>
                index === self.findIndex((r) => r.formatted === result.formatted)
            )
            .slice(0, 10); // Limit to 10 results

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch city suggestions' },
            { status: 500 }
        );
    }
}
