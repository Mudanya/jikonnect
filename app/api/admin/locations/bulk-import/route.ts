import { withRole } from '@/lib/api-auth';
import { prisma } from '@/prisma/prisma.init';
import { AuthenticatedRequest } from '@/types/auth';
import { NextResponse } from 'next/server';


interface ImportLocation {
    zoneName: string;
    clusterName?: string;
    locationName: string;
    latitude?: number;
    longitude?: number;
    matchingRadius?: number;
}

export const POST = withRole("ADMIN")(async (req: AuthenticatedRequest) => {
    try {


        const body = await req.json();
        const locations: ImportLocation[] = body.locations;

        if (!Array.isArray(locations) || locations.length === 0) {
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 }
            );
        }

        const results = {
            created: 0,
            skipped: 0,
            errors: [] as string[],
        };

        // Get all zones and clusters for reference
        const zones = await prisma.zone.findMany({
            where: { active: true },
            include: { clusters: true },
        });

        const zoneMap = new Map(zones.map(z => [z.name.toLowerCase(), z]));

        for (const loc of locations) {
            try {
                // Find zone
                const zone = zoneMap.get(loc.zoneName.toLowerCase());
                if (!zone) {
                    results.errors.push(`Zone not found: ${loc.zoneName}`);
                    results.skipped++;
                    continue;
                }

                // Find cluster if specified
                let clusterId = null;
                if (loc.clusterName) {
                    const cluster = zone.clusters.find(
                        c => c.name.toLowerCase() === loc.clusterName?.toLowerCase()
                    );
                    if (cluster) {
                        clusterId = cluster.id;
                    } else {
                        results.errors.push(
                            `Cluster not found: ${loc.clusterName} in ${loc.zoneName}`
                        );
                    }
                }

                // Generate slug
                const slug = loc.locationName
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');

                // Check if location already exists
                const existing = await prisma.location.findUnique({
                    where: { slug },
                });

                if (existing) {
                    results.skipped++;
                    continue;
                }

                // Create location
                await prisma.location.create({
                    data: {
                        name: loc.locationName,
                        slug,
                        zoneId: zone.id,
                        clusterId,
                        latitude: loc.latitude || null,
                        longitude: loc.longitude || null,
                        matchingRadius: loc.matchingRadius || 5,
                        active: true,
                    },
                });

                results.created++;
            } catch (error) {
                console.error(`Error importing location ${loc.locationName}:`, error);
                results.errors.push(
                    `Failed to import ${loc.locationName}: ${error instanceof Error ? error.message : 'Unknown error'}`
                );
                results.skipped++;
            }
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error in bulk import:', error);
        return NextResponse.json(
            { error: 'Failed to import locations' },
            { status: 500 }
        );
    }
})