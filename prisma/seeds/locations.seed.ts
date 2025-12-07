// prisma/seeds/locations.seed.ts

import { prisma } from "../prisma.init";

export const locationData = {
  zones: [
    {
      name: 'CBD & Central Zone',
      slug: 'cbd-central',
      color: '#10B981', // Green
      order: 1,
      clusters: [],
      locations: [
        'Nairobi CBD',
        'Upperhill',
        'Community',
        'Ngara',
        'Parklands',
        'Westlands',
        'Museum Hill',
        'Riverside',
        'Kileleshwa',
      ],
    },
    {
      name: 'Eastlands Zone',
      slug: 'eastlands',
      color: '#EAB308', // Yellow
      order: 2,
      clusters: [
        {
          name: 'Donholm Cluster',
          locations: ['Donholm', 'Umoja 1', 'Umoja 2', 'Savannah', 'GreenSpan', 'Jacaranda'],
        },
        {
          name: 'Embakasi–Pipeline Cluster',
          locations: [
            'Embakasi',
            'Pipeline',
            'Tassia',
            'Fedha',
            'Nyayo Estate',
            'Avenue Park',
            'Utawala',
          ],
        },
        {
          name: 'Buruburu Cluster',
          locations: [
            'Buruburu Phase 1',
            'Buruburu Phase 2',
            'Buruburu Phase 3',
            'Buruburu Phase 4',
            'Buruburu Phase 5',
            'Harambee Estate',
            'Makadara',
            'Hamza',
            'Jericho',
            'Ofafa Jericho',
          ],
        },
        {
          name: 'Kayole Cluster',
          locations: [
            'Kayole',
            'Komarock Phase 1',
            'Komarock Phase 2',
            'Komarock Phase 3',
            'Chokaa',
          ],
        },
      ],
    },
    {
      name: 'Thika Road Zone',
      slug: 'thika-road',
      color: '#F97316', // Orange
      order: 3,
      clusters: [
        {
          name: 'Kasarani Cluster',
          locations: ['Kasarani', 'Mwiki', 'Hunters', 'Seasons', 'Sunton'],
        },
        {
          name: 'Roysambu Cluster',
          locations: ['Roysambu', 'Zimmerman', 'TRM Drive', 'Lumumba Drive'],
        },
        {
          name: 'Kahawa Cluster',
          locations: [
            'Kahawa West',
            'Kahawa Sukari',
            'Kahawa Wendani',
            'Kongo',
            'Githurai 44',
            'Githurai 45',
          ],
        },
      ],
    },
    {
      name: 'Westlands & Mountain View Zone',
      slug: 'westlands-mountain-view',
      color: '#3B82F6', // Blue
      order: 4,
      clusters: [],
      locations: [
        'Westlands',
        'Kangemi',
        'Mountain View',
        'Loresho',
        'Spring Valley',
        'Waiyaki Way',
      ],
    },
    {
      name: 'Kilimani–Lavington Zone',
      slug: 'kilimani-lavington',
      color: '#10B981', // Green
      order: 5,
      clusters: [],
      locations: [
        'Kilimani',
        'Hurlingham',
        'Yaya Area',
        'Lavington',
        'Kileleshwa',
        'Thompson Estate',
        'Woodley',
        'Adams',
      ],
    },
    {
      name: 'Ngong Road Zone',
      slug: 'ngong-road',
      color: '#EF4444', // Red
      order: 6,
      clusters: [],
      locations: [
        'Ngong Road',
        'Dagoretti Corner',
        'Jamhuri Estate',
        'Riruta',
        'Satellite',
        'Waithaka',
        'Karen-Ngong Buffer',
      ],
    },
    {
      name: 'Karen & Lang\'ata Zone',
      slug: 'karen-langata',
      color: '#78350F', // Brown
      order: 7,
      clusters: [],
      locations: [
        'Karen',
        'Lang\'ata',
        'Southlands',
        'Onyonka Estate',
        'Kibera DC Area',
      ],
    },
    {
      name: 'South B & South C Zone',
      slug: 'south-b-south-c',
      color: '#A855F7', // Purple
      order: 8,
      clusters: [],
      locations: [
        'South B',
        'South C',
        'Hazina',
        'Plainsview',
        'Belleview',
        'Imara Daima',
        'Mombasa Road',
      ],
    },
    {
      name: 'Mombasa Road Expansion Zone',
      slug: 'mombasa-road-expansion',
      color: '#F97316', // Orange
      order: 9,
      clusters: [],
      locations: [
        'Syokimau',
        'Mlolongo',
        'Katani',
        'Sabaki',
        'Athi River',
      ],
    },
    {
      name: 'Ruiru & Eastern Bypass Zone',
      slug: 'ruiru-eastern-bypass',
      color: '#3B82F6', // Blue
      order: 10,
      clusters: [],
      locations: [
        'Ruiru',
        'Membley',
        'Bypass Estate',
        'Kamakis',
        'Toll Area',
      ],
    },
    {
      name: 'Ruaka & Kiambu Road Zone',
      slug: 'ruaka-kiambu-road',
      color: '#78350F', // Brown
      order: 11,
      clusters: [],
      locations: [
        'Ruaka',
        'Two Rivers Area',
        'Rosslyn',
        'Kiambu Road',
        'Ridgeways',
        'Thindigua',
      ],
    },
    {
      name: 'Juja–Thika Zone',
      slug: 'juja-thika',
      color: '#10B981', // Green
      order: 12,
      clusters: [],
      locations: [
        'Juja',
        'Kenyatta Road',
        'Thika Town',
      ],
    },
  ],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function createUniqueSlug(
  locationName: string,
  zoneName: string,
  clusterName?: string
): string {
  const baseSlug = slugify(locationName);
  const zoneSlug = slugify(zoneName);

  if (clusterName) {
    const clusterSlug = slugify(clusterName);
    return `${baseSlug}-${clusterSlug}`;
  }

  return `${baseSlug}-${zoneSlug}`;
}



export async function seedLocations() {
  console.log('🌍 Starting location seeding...');

  for (const zoneData of locationData.zones) {
    console.log(`\n📍 Creating zone: ${zoneData.name}`);

    // Create zone
    const zone = await prisma.zone.create({
      data: {
        name: zoneData.name,
        slug: zoneData.slug,
        color: zoneData.color,
        order: zoneData.order,
        active: true,
      },
    });

    // Create clusters if any
    if (zoneData.clusters && zoneData.clusters.length > 0) {
      for (let i = 0; i < zoneData.clusters.length; i++) {
        const clusterData = zoneData.clusters[i];
        console.log(`  📂 Creating cluster: ${clusterData.name}`);

        const cluster = await prisma.cluster.create({
          data: {
            name: clusterData.name,
            slug: slugify(clusterData.name),
            zoneId: zone.id,
            order: i + 1,
            active: true,
          },
        });

        // Create locations in cluster
        for (const locationName of clusterData.locations) {
          await prisma.location.create({
            data: {
              name: locationName,
              slug: createUniqueSlug(locationName, zone.name, cluster?.name),
              zoneId: zone.id,
              clusterId: cluster.id,
              matchingRadius: 5, // Default 5km
              active: true,
            },
          });
          console.log(`    ✓ ${locationName}`);
        }
      }
    }

    // Create standalone locations (no cluster)
    if (zoneData.locations && zoneData.locations.length > 0) {
      for (const locationName of zoneData.locations) {
        await prisma.location.create({
          data: {
            name: locationName,
            slug: createUniqueSlug(locationName, zone.name),
            zoneId: zone.id,
            clusterId: null,
            matchingRadius: 5, // Default 5km
            active: true,
          },
        });
        console.log(`  ✓ ${locationName}`);
      }
    }
  }

  const stats = await prisma.$transaction([
    prisma.zone.count(),
    prisma.cluster.count(),
    prisma.location.count(),
  ]);

  console.log('\n✅ Location seeding complete!');
  console.log(`📊 Created: ${stats[0]} zones, ${stats[1]} clusters, ${stats[2]} locations`);
}

// Main function to run seeding
async function main() {
  try {
    await seedLocations();
  } catch (error) {
    console.error('Error seeding locations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default main;