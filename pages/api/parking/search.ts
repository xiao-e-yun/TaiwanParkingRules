import type {NextApiRequest, NextApiResponse} from 'next';
import {City, ParkingSearchSchema} from '@/lib/schemas';
import {env} from 'process';
import _ from 'lodash';
import {int} from 'zod/v4';

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const carParkData = new Map() as Map<string, {
  carParkName: {
    zh_tw: string,
    en: string
  },
  telephone: string,
  location: {
    latitude: number,
    longitude: number
  },
  description: string,
  address: string,
  imageURL?: string,
}>

let expiredAt = 0;
let accessToken: string | null = null;
async function getAccessToken():Promise<string> {
  const now = Date.now();
  if (accessToken && now < expiredAt) {
    return accessToken;
  }

  const response = await fetch('https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'client_id': env.TDX_CLIENT_ID || '',
      'client_secret': env.TDX_CLIENT_SECRET || '',
      'grant_type': 'client_credentials',
    }),
  })
  const data = await (response).json()

  if (!data.access_token) {
    throw new Error('Failed to get access token from TDX');
  }

  expiredAt = now + (data.expires_in * 1000) - 60000; // 1 minute before expiration
  return accessToken = data.access_token;
}


const loadedCities = new Set<City>();
async function loadMockCarParkData(city: City) {
  if (loadedCities.has(city)) return

  console.log(`Loading mock car park data for ${city}...`);

  const token = await getAccessToken();
  const response = await fetch(`https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/CarPark/City/${city}?&%24format=JSON`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })
  const data = (await response.json()).CarParks;
  loadedCities.add(city);

  for (const carPark of data) {
    carParkData.set(`${city}-${carPark.CarParkID}`, {
      carParkName: {
        zh_tw: carPark.CarParkName.Zh_tw,
        en: carPark.CarParkName.En,
      },
      telephone: carPark.Telephone || carPark.EmergencyPhone || '',
      description: carPark.Description || '',
      location: {
        latitude: carPark.CarParkPosition.PositionLat,
        longitude: carPark.CarParkPosition.PositionLon,
      },
      address: carPark.Address || '',
      imageURL: (carPark.ImageURLs || [])[0],
    });
  }
}

function getMockCarParkData(city: City, id: string) {
  return carParkData.get(`${city}-${id}`);
}

const carParkCache = new Map<City, {
  expiredAt: number;
  values: {
    CarParkID: string;
    CarParkName: {
      Zh_tw: string;
      En: string;
    };
    Availabilities: {
      SpaceType: number;
      NumberOfSpaces: number;
      AvailableSpaces: number;
    }[];
  }[]
}>()

async function getAvailableCarParks(city: City) {
  if (carParkCache.has(city)) {
    const cache = carParkCache.get(city)!;
    if (cache.expiredAt > Date.now()) {
      return cache.values;
    }
  }

  console.log(`Fetching parking availability for ${city} from TDX API...`);
  const token = await getAccessToken();
  const response = await fetch("https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/ParkingAvailability/City/" + city + "?%24format=JSON", {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  const values = (await response.json()).ParkingAvailabilities;
  carParkCache.set(city, {
    expiredAt: Date.now() + 60000, // Cache for 1 minutes
    values: values.map((lot: any) => ({
      CarParkID: lot.CarParkID,
      CarParkName: {
        Zh_tw: lot.CarParkName.Zh_tw,
        En: lot.CarParkName.En,
      },
      Availabilities: lot.Availabilities.map((avail: any) => ({
        SpaceType: avail.SpaceType,
        NumberOfSpaces: avail.NumberOfSpaces,
        AvailableSpaces: avail.AvailableSpaces,
      })),
    })),
  });

  return carParkCache.get(city)!.values;

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  try {

    const data = await getAvailableCarParks(req.query.city as City);

    const params = ParkingSearchSchema.parse({
      city: req.query.city as string,
      parkingType: req.query.parkingType as string,
      availability: req.query.availability as string,
      location: req.query.latitude && req.query.longitude ? {
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
      } : undefined,
    });


    const spaceTypeMapping = {
      "Car": 1,
      "Scooter": 2,
      "Heavy": 5,
    };

    const availableSpaceTypes = {
      "Any": 0,
      "Few": 3,
      "Many": 5,
      "Available": 1,
    }

    await loadMockCarParkData(params.city);
    const result = _.chain(data)
      .filter((lot) => {
        return lot.Availabilities.some(avail => {
          const spaceType = spaceTypeMapping[params.parkingType];
          const availability = availableSpaceTypes[params.availability];
          return avail.SpaceType === spaceType && avail.AvailableSpaces >= availability;
        })
      })
      .map(lot => {
        const carPark = getMockCarParkData(params.city, lot.CarParkID);
        const available = lot.Availabilities.find(avail => avail.SpaceType === spaceTypeMapping[params.parkingType])!;

        return {
          carParkName: {
            zh_tw: lot.CarParkName.Zh_tw,
            en: lot.CarParkName.En,
          },
          totalSpaces: available?.NumberOfSpaces || 0,
          availableSpaces: available?.AvailableSpaces || 0,
          location: carPark?.location || { latitude: 0, longitude: 0 },
          address: carPark?.address || '',
          telephone: carPark?.telephone || '',
          imageURL: carPark?.imageURL || '',
          description: carPark?.description || '',
          distance: params.location && calculateDistance(params.location.latitude, params.location.longitude, carPark?.location.latitude || 0, carPark?.location.longitude || 0),
        };
      })
      .sort((lotA, lotB) => {
        if (params.location && lotA.distance !== undefined && lotB.distance !== undefined) {
          return lotA.distance - lotB.distance;
        }
        // otherwise sort by available spaces
        return lotB.availableSpaces - lotA.availableSpaces;
      })
      .value();

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid search parameters'
    });
  }
}
