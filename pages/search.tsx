import React, { useState } from 'react';
import { GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Search, 
  Filter,
  Clock,
  DollarSign,
  Navigation,
  Car,
  AlertCircle
} from 'lucide-react';
import { ParkingSearchSchema, type ParkingSearchInput } from '@/lib/schemas';

interface ParkingLot {
  id: string;
  name: string;
  address: string;
  distance: number;
  availableSpaces: number;
  totalSpaces: number;
  price: number;
  updatedAt: string;
}

const SearchPage: React.FC = () => {
  const { t } = useTranslation(['search', 'common']);
  const [searchForm, setSearchForm] = useState<ParkingSearchInput>({
    city: '',
    location: '',
    maxDistance: 5,
    parkingType: 'car',
    availability: 'any'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ParkingLot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const cities = [
    { value: 'taipei', label: t('search:options.cities.taipei') },
    { value: 'taichung', label: t('search:options.cities.taichung') },
    { value: 'kaohsiung', label: t('search:options.cities.kaohsiung') },
    { value: 'tainan', label: t('search:options.cities.tainan') },
    { value: 'taoyuan', label: t('search:options.cities.taoyuan') },
    { value: 'hsinchu', label: t('search:options.cities.hsinchu') },
  ];

  const parkingTypes = [
    { value: 'car', label: t('search:options.parkingTypes.car') },
    { value: 'scooter', label: t('search:options.parkingTypes.scooter') },
    { value: 'both', label: t('search:options.parkingTypes.both') },
  ];

  const availabilityOptions = [
    { value: 'any', label: t('search:options.availability.any') },
    { value: 'available', label: t('search:options.availability.available') },
    { value: 'few', label: t('search:options.availability.few') },
  ];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = ParkingSearchSchema.parse(searchForm);
      setIsSearching(true);
      setHasSearched(true);

      // Call our API endpoint
      const queryParams = new URLSearchParams({
        city: validatedData.city,
        location: validatedData.location || '',
        maxDistance: validatedData.maxDistance.toString(),
        parkingType: validatedData.parkingType,
        availability: validatedData.availability,
        ...(validatedData.maxPrice && { maxPrice: validatedData.maxPrice.toString() })
      });

      const response = await fetch(`/api/parking/search?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        // Transform API response to our component format
        const transformedResults: ParkingLot[] = result.data.map((lot: any) => ({
          id: lot.ParkingLotID,
          name: lot.ParkingLotName,
          address: lot.Address,
          distance: lot.distance,
          availableSpaces: lot.AvailableSpaces,
          totalSpaces: lot.TotalSpaces,
          price: parseInt(lot.PayGuide.match(/NT\$(\d+)/)?.[1] || '40'),
          updatedAt: lot.UpdateTime
        }));
        
        setSearchResults(transformedResults);
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                        onChange={(e) => setSearchForm(prev => ({ ...prev, city: e.target.value }))}
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

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('search:form.location')}
                      </label>
                      <input
                        type="text"
                        value={searchForm.location}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder={t('search:form.locationPlaceholder')}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Distance Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('search:form.maxDistance')}: {searchForm.maxDistance}km
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        value={searchForm.maxDistance}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, maxDistance: Number(e.target.value) }))}
                        className="w-full"
                      />
                    </div>

                    {/* Parking Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('search:form.parkingType')}
                      </label>
                      <select
                        value={searchForm.parkingType}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, parkingType: e.target.value as any }))}
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
                        onChange={(e) => setSearchForm(prev => ({ ...prev, availability: e.target.value as any }))}
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
                        <Card key={lot.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {lot.name}
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {lot.address}
                                  </div>
                                  <div className="flex items-center">
                                    <Navigation className="h-4 w-4 mr-2" />
                                    {t('search:results.distance')}: {lot.distance}km
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {t('search:results.updated')}: {formatTime(lot.updatedAt)}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-blue-600 mb-1">
                                  NT${lot.price}/hr
                                </div>
                                <div className="text-sm text-gray-600">
                                  <div className={`font-medium ${
                                    lot.availableSpaces > 20 ? 'text-green-600' : 
                                    lot.availableSpaces > 5 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {lot.availableSpaces}/{lot.totalSpaces} {t('search:results.available')}
                                  </div>
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

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common', 'search'])),
    },
  };
};

export default SearchPage;
