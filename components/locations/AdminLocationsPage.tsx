'use client';

import ClustersManager from '@/components/locations/ClustersManager';
import LocationsManager from '@/components/locations/LocationsManager';
import ZonesManager from '@/components/locations/ZonesManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminLocationsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Location Management</h1>
        <p className="text-muted-foreground">
          Manage zones, clusters, and locations for the JiKonnect platform
        </p>
      </div>

      <Tabs defaultValue="zones" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Zones</CardTitle>
              <CardDescription>
                Manage geographical zones in Kenya i.e Nairobi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ZonesManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clusters</CardTitle>
              <CardDescription>
                Manage clusters within zones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClustersManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage specific locations within clusters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationsManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}