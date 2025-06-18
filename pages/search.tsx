import React, {useEffect, useState} from 'react';
import {GetStaticProps} from 'next';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Layout from '@/components/Layout';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  MapPin,
  Search,
  Navigation,
  AlertCircle,
  Phone
} from 'lucide-react';
import {City, ParkingAvailability, ParkingSearchSchema, ParkingType, type ParkingSearchInput} from '@/lib/schemas';
import {useRouter} from 'next/router';

interface ParkingLot {
  carParkName: {
    "zh-TW": string;
    en: string;
  },
  totalSpaces: number,
  availableSpaces: number,
  location: {latitude: number, longitude: number},
  address: string,
  telephone: string,
  imageURL: string,
  distance: number,
  description: string,
}

const cityCoordinates = [
  [City.Taipei, {"latitude": 25.0330, "longitude": 121.5654}],
  [City.Taoyuan, {"latitude": 24.9937, "longitude": 121.3036}],
  [City.Taichung, {"latitude": 24.1477, "longitude": 120.6736}],
  [City.Tainan, {"latitude": 22.9960, "longitude": 120.2152}],
  [City.Kaohsiung, {"latitude": 22.6273, "longitude": 120.3014}],
  [City.Keelung, {"latitude": 25.1291, "longitude": 121.7468}],
  [City.ChanghuaCounty, {"latitude": 24.5644, "longitude": 120.8206}],
  [City.YunlinCounty, {"latitude": 23.9155, "longitude": 120.6871}],
  [City.PingtungCounty, {"latitude": 22.6726, "longitude": 120.4878}],
  [City.YilanCounty, {"latitude": 24.7560, "longitude": 121.7549}],
  [City.HualienCounty, {"latitude": 23.9764, "longitude": 121.6099}],
  [City.KinmenCounty, {"latitude": 23.5685, "longitude": 119.5768}],
] as [City, {latitude: number; longitude: number}][];

const SearchPage: React.FC = () => {
  const {t} = useTranslation(['search', 'common']);
  const [searchForm, setSearchForm] = useState<ParkingSearchInput>({
    city: City.Taipei,
    parkingType: ParkingType.Car,
    availability: ParkingAvailability.Available,
  });

  useEffect(() => {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition((currentPosition) => {
        const latitude = currentPosition.coords.latitude;
        const longitude = currentPosition.coords.longitude;

        setSearchForm(prev => ({
          ...prev,
          city: cityCoordinates.toSorted(([, a], [, b]) => {
            const distA = Math.sqrt(Math.pow(a.latitude - latitude, 2) + Math.pow(a.longitude - longitude, 2));
            const distB = Math.sqrt(Math.pow(b.latitude - latitude, 2) + Math.pow(b.longitude - longitude, 2));
            return distA - distB;
          })[0][0],

          location: {
            latitude,
            longitude
          }
        }));
      }, () => console.warn('Geolocation is not supported by this browser.'));
  }, [])

  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ParkingLot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const cities = [
    {value: City.Taipei, label: t('search:options.cities.taipei')},
    {value: City.Taoyuan, label: t('search:options.cities.taoyuan')},
    {value: City.Taichung, label: t('search:options.cities.taichung')},
    {value: City.Tainan, label: t('search:options.cities.tainan')},
    {value: City.Kaohsiung, label: t('search:options.cities.kaohsiung')},
    {value: City.Keelung, label: t('search:options.cities.keelung')},
    {value: City.ChanghuaCounty, label: t('search:options.cities.changhuacounty')},
    {value: City.YunlinCounty, label: t('search:options.cities.yunlincounty')},
    {value: City.PingtungCounty, label: t('search:options.cities.pingtungcounty')},
    {value: City.YilanCounty, label: t('search:options.cities.yilancounty')},
    {value: City.HualienCounty, label: t('search:options.cities.hualiencounty')},
    {value: City.KinmenCounty, label: t('search:options.cities.kinmencounty')},
  ];

  const parkingTypes = [
    {value: ParkingType.Car, label: t('search:options.parkingTypes.car')},
    {value: ParkingType.Heavy, label: t('search:options.parkingTypes.heavy')},
    {value: ParkingType.Scooter, label: t('search:options.parkingTypes.scooter')},
  ];

  const availabilityOptions = [
    {value: ParkingAvailability.Any, label: t('search:options.availability.any')},
    {value: ParkingAvailability.Available, label: t('search:options.availability.available')},
    {value: ParkingAvailability.Many, label: t('search:options.availability.many')},
    {value: ParkingAvailability.Few, label: t('search:options.availability.few')},
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validatedData = ParkingSearchSchema.parse(searchForm);
      setIsSearching(true);
      setHasSearched(true);

      const params = {
        city: validatedData.city,
        parkingType: validatedData.parkingType,
        availability: validatedData.availability,
        latitude: validatedData.location?.latitude.toString(),
        longitude: validatedData.location?.longitude.toString(),
      } as Record<string, string>;
      if (!params.latitude || !params.longitude) {
        delete params.latitude;
        delete params.longitude;
      }

      const response = await fetch(`/api/parking/search?${new URLSearchParams(params).toString()}`)

      const result: {
        success: boolean;
        data?: []
        error?: string;
      } = await response.json();

      if (result.success) {
        setSearchResults(result.data!)
      } else {
        console.error('API Error:', result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const language = useRouter().locale || "zh-TW";

  return (
    <Layout title={t('search:title')}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('search:title')}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('search:subtitle')}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Search Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2" />
                    {t('search:filters.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-4">
                    {/* City Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('search:form.city')}
                      </label>
                      <select
                        value={searchForm.city}
                        onChange={(e) => setSearchForm(prev => ({...prev, city: e.target.value as City}))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">{t('search:form.cityPlaceholder')}</option>
                        {cities.map(city => (
                          <option key={city.value} value={city.value}>
                            {city.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Parking Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('search:form.parkingType')}
                      </label>
                      <select
                        value={searchForm.parkingType}
                        onChange={(e) => setSearchForm(prev => ({...prev, parkingType: e.target.value as any}))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {parkingTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Availability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('search:form.availability')}
                      </label>
                      <select
                        value={searchForm.availability}
                        onChange={(e) => setSearchForm(prev => ({...prev, availability: e.target.value as any}))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {availabilityOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Search Button */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSearching || !searchForm.city}
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {t('search:results.loading')}
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          {t('common:buttons.search')}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Search Results */}
            <div className="lg:col-span-2">
              {hasSearched && (
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('search:results.title')}
                  </h2>

                  {isSearching ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">{t('search:results.loading')}</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">{t('search:results.noResults')}</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {searchResults.map((lot) => (
                        <Card key={lot.carParkName["zh-TW"]} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6 bg-cover" style={{backgroundImage: `url(${lot.imageURL})`}} >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex justify-between w-full">
                                  { lot.carParkName[language as "zh-TW" | "en"] || lot.carParkName["zh-TW"] }
                                  <div className={`font-medium ${lot.availableSpaces > 5 ? 'text-green-600' : lot.availableSpaces > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {lot.availableSpaces} {t('search:results.available')}
                                  </div>
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {lot.address}

                                    <Button className="ml-auto text-xs text-secondary" variant="outline" size="sm" asChild>
                                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${lot.location.latitude},${lot.location.longitude}`} target="_blank" rel="noopener noreferrer">
                                      <Navigation className="h-4 w-4 mr-1" />
                                      {t('search:results.navigation')}
                                    </a>
                                    </Button>
                                  </div>
                                  {
                                    lot.distance && (
                                      <div className="flex items-center">
                                        <Navigation className="h-4 w-4 mr-2" />
                                        {t('search:results.distance')}: {lot.distance.toFixed(1)}km
                                      </div>
                                    )
                                  }
                                  {
                                    lot.telephone && (
                                      <div className="flex items-center">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {lot.telephone}
                                      </div>
                                    )
                                  }
                                  {
                                    lot.description && (
                                      <div className="text-gray-500">
                                        {lot.description}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({locale}) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'search'])),
    },
  };
};

export default SearchPage;
