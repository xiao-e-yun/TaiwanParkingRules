import type { NextApiRequest, NextApiResponse } from 'next';
import { ParkingSearchSchema } from '@/lib/schemas';

// Mock TDX parking data
const mockParkingData = [
  {
    ParkingLotID: 'TP001',
    ParkingLotName: '台北車站地下停車場',
    TotalSpaces: 200,
    AvailableSpaces: 45,
    Coordinate: { Latitude: 25.0478, Longitude: 121.5171 },
    Address: '台北市中正區北平西路3號',
    Description: '24小時營業，有電動車充電站',
    PayGuide: 'NT$40/小時，當日最高NT$200',
    UpdateTime: new Date().toISOString(),
  },
  {
    ParkingLotID: 'TP002',
    ParkingLotName: '信義威秀停車場',
    TotalSpaces: 150,
    AvailableSpaces: 12,
    Coordinate: { Latitude: 25.0360, Longitude: 121.5645 },
    Address: '台北市信義區松壽路20號',
    Description: '購物中心停車場，有遮蔽',
    PayGuide: 'NT$60/小時，消費滿額可享優惠',
    UpdateTime: new Date().toISOString(),
  },
  {
    ParkingLotID: 'TP003',
    ParkingLotName: '西門町停車場',
    TotalSpaces: 120,
    AvailableSpaces: 68,
    Coordinate: { Latitude: 25.0421, Longitude: 121.5067 },
    Address: '台北市萬華區成都路10號',
    Description: '近西門紅樓，步行商圈方便',
    PayGuide: 'NT$30/小時，夜間優惠價NT$20',
    UpdateTime: new Date().toISOString(),
  },
  {
    ParkingLotID: 'TC001',
    ParkingLotName: '台中火車站停車場',
    TotalSpaces: 180,
    AvailableSpaces: 32,
    Coordinate: { Latitude: 24.1367, Longitude: 120.6851 },
    Address: '台中市中區台灣大道一段1號',
    Description: '火車站旁，交通便利',
    PayGuide: 'NT$25/小時，當日最高NT$150',
    UpdateTime: new Date().toISOString(),
  },
  {
    ParkingLotID: 'KH001',
    ParkingLotName: '高雄夢時代停車場',
    TotalSpaces: 300,
    AvailableSpaces: 89,
    Coordinate: { Latitude: 22.5926, Longitude: 120.3059 },
    Address: '高雄市前鎮區中華五路789號',
    Description: '大型購物中心，有冷氣空調',
    PayGuide: 'NT$35/小時，消費可享折抵',
    UpdateTime: new Date().toISOString(),
  }
];

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate query parameters
    const searchParams = {
      city: req.query.city as string,
      location: req.query.location as string || '',
      maxDistance: Number(req.query.maxDistance) || 10,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      parkingType: req.query.parkingType as string || 'car',
      availability: req.query.availability as string || 'any',
    };

    const validatedParams = ParkingSearchSchema.parse(searchParams);

    // City coordinates for reference (simplified)
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      taipei: { lat: 25.0330, lng: 121.5654 },
      taichung: { lat: 24.1477, lng: 120.6736 },
      kaohsiung: { lat: 22.6273, lng: 120.3014 },
      tainan: { lat: 22.9999, lng: 120.2269 },
      taoyuan: { lat: 24.9936, lng: 121.3010 },
      hsinchu: { lat: 24.8138, lng: 120.9675 },
    };

    const cityCoord = cityCoordinates[validatedParams.city];
    if (!cityCoord) {
      return res.status(400).json({ error: 'Unsupported city' });
    }

    // Filter parking lots by city (simplified - based on city prefix)
    let filteredLots = mockParkingData.filter(lot => {
      const cityPrefix = validatedParams.city === 'taipei' ? 'TP' :
                        validatedParams.city === 'taichung' ? 'TC' :
                        validatedParams.city === 'kaohsiung' ? 'KH' : 'TP';
      return lot.ParkingLotID.startsWith(cityPrefix);
    });

    // Calculate distances and filter by maxDistance
    const lotsWithDistance = filteredLots.map(lot => {
      const distance = calculateDistance(
        cityCoord.lat, cityCoord.lng,
        lot.Coordinate.Latitude, lot.Coordinate.Longitude
      );
      return { ...lot, distance: Math.round(distance * 10) / 10 };
    }).filter(lot => lot.distance <= validatedParams.maxDistance);

    // Filter by availability
    if (validatedParams.availability === 'available') {
      lotsWithDistance.filter(lot => lot.AvailableSpaces > 10);
    } else if (validatedParams.availability === 'few') {
      lotsWithDistance.filter(lot => lot.AvailableSpaces <= 10 && lot.AvailableSpaces > 0);
    }

    // Sort by distance
    lotsWithDistance.sort((a, b) => a.distance - b.distance);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    res.status(200).json({
      success: true,
      data: lotsWithDistance,
      total: lotsWithDistance.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Search API error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Invalid search parameters'
    });
  }
}
