// prisma/seeds/services-simple.seed.ts

import { prisma } from "../prisma.init";


const servicesData = [
  {
    name: "Home Care & Domestic Services",
    slug: "home-care-domestic",
    icon: "🏠",
    description: "Professional home and domestic care services",
    order: 1,
    services: [
      { name: "House cleaning", slug: "house-cleaning", skillLevels: ["Basic", "Professional"] },
      { name: "Deep cleaning / Move-out cleaning", slug: "deep-cleaning", skillLevels: ["Basic", "Professional"] },
      { name: "Laundry & ironing", slug: "laundry-ironing", skillLevels: ["Basic"] },
      { name: "Nanny / childcare services", slug: "nanny-childcare", skillLevels: ["Basic", "Certified (ICRC, Red Cross, NITA)"] },
      { name: "Elderly caregiving", slug: "elderly-caregiving", skillLevels: ["Basic", "Certified Caregiver"] },
      { name: "Cook / meal preparation", slug: "cook-meal-prep", skillLevels: ["Basic", "Professional Chef"] },
      { name: "Domestic housekeeper", slug: "domestic-housekeeper", skillLevels: ["Basic", "Professional"] },
      { name: "Garden maintenance", slug: "garden-maintenance", skillLevels: ["Basic", "Professional Gardener"] },
    ]
  },
  {
    name: "Beauty, Wellness & Personal Care",
    slug: "beauty-wellness",
    icon: "💅",
    description: "Beauty and wellness services",
    order: 2,
    services: [
      { name: "Hairdressing / Salon services", slug: "hairdressing-salon", skillLevels: ["Artisan", "Professional"] },
      { name: "Barber services", slug: "barber-services", skillLevels: ["Artisan", "Professional"] },
      { name: "Massage therapy", slug: "massage-therapy", skillLevels: ["Intermediate", "Professional Therapist"] },
      { name: "Makeup artists", slug: "makeup-artists", skillLevels: ["Artisan", "Professional"] },
      { name: "Nail technicians", slug: "nail-technicians", skillLevels: ["Artisan", "Professional"] },
      { name: "Spa & aesthetic treatments", slug: "spa-aesthetic", skillLevels: ["Professional", "Certified"] },
      { name: "Mobile beauty services", slug: "mobile-beauty", skillLevels: ["Artisan", "Professional"] },
      { name: "Traditional wellness", slug: "traditional-wellness", skillLevels: ["Practitioner", "Certified"] },
    ]
  },
  {
    name: "Plumbing & Water Systems",
    slug: "plumbing-water",
    icon: "🔧",
    description: "Professional plumbing and water services",
    order: 3,
    services: [
      { name: "Plumbing repairs", slug: "plumbing-repairs", skillLevels: ["Artisan", "Technician"] },
      { name: "Pipe installation", slug: "pipe-installation", skillLevels: ["Artisan", "Technician"] },
      { name: "Leak fixing", slug: "leak-fixing", skillLevels: ["Artisan", "Technician"] },
      { name: "Water tank installation", slug: "water-tank-installation", skillLevels: ["Technician", "Craft Certificate"] },
      { name: "Borehole pump maintenance", slug: "borehole-pump", skillLevels: ["Technician", "Certified"] },
      { name: "Bathroom & toilet installations", slug: "bathroom-toilet", skillLevels: ["Artisan", "Technician"] },
      { name: "Septic system services", slug: "septic-system", skillLevels: ["Technician", "Certified"] },
    ]
  },
  {
    name: "Electrical & Solar Services",
    slug: "electrical-solar",
    icon: "⚡",
    description: "Electrical installation and solar solutions",
    order: 4,
    services: [
      { name: "House wiring", slug: "house-wiring", skillLevels: ["Artisan", "Licensed Electrician"] },
      { name: "Electrical fault repair", slug: "electrical-fault-repair", skillLevels: ["Artisan", "Licensed Electrician"] },
      { name: "Socket/switch installation", slug: "socket-switch-installation", skillLevels: ["Artisan", "Licensed Electrician"] },
      { name: "Lighting installation", slug: "lighting-installation", skillLevels: ["Artisan", "Licensed Electrician"] },
      { name: "Solar panel installation", slug: "solar-panel-installation", skillLevels: ["Solar Technician", "EPRA Certified"] },
      { name: "Solar backup systems", slug: "solar-backup", skillLevels: ["Solar Technician", "EPRA Certified"] },
      { name: "Appliance repair", slug: "appliance-repair", skillLevels: ["Artisan", "Technician"] },
    ]
  },
  {
    name: "Construction & Handyman",
    slug: "construction-handyman",
    icon: "🏗️",
    description: "Construction and general handyman services",
    order: 5,
    services: [
      { name: "Masonry", slug: "masonry", skillLevels: ["Artisan", "Craft Technician"] },
      { name: "Carpentry", slug: "carpentry", skillLevels: ["Artisan", "Craft Technician"] },
      { name: "Roofing", slug: "roofing", skillLevels: ["Artisan", "Craft Technician"] },
      { name: "Tiling", slug: "tiling", skillLevels: ["Artisan", "Craft Technician"] },
      { name: "Painting", slug: "painting", skillLevels: ["Artisan", "Professional Painter"] },
      { name: "Gypsum work", slug: "gypsum-work", skillLevels: ["Artisan", "Craft Technician"] },
      { name: "Ceiling repair", slug: "ceiling-repair", skillLevels: ["Artisan", "Craft Technician"] },
      { name: "Welding / metal fabrication", slug: "welding-metal", skillLevels: ["Artisan", "Certified Welder"] },
      { name: "General handyman", slug: "general-handyman", skillLevels: ["Basic", "Experienced"] },
    ]
  },
  {
    name: "Mechanical & Auto Services",
    slug: "mechanical-auto",
    icon: "🚗",
    description: "Vehicle maintenance and repair services",
    order: 6,
    services: [
      { name: "Car service & maintenance", slug: "car-service-maintenance", skillLevels: ["Artisan Mechanic", "Auto Technician"] },
      { name: "Mobile mechanic", slug: "mobile-mechanic", skillLevels: ["Artisan Mechanic", "Auto Technician"] },
      { name: "Bodywork / panel beating", slug: "bodywork-panel", skillLevels: ["Artisan", "Auto Technician"] },
      { name: "Windshield repair", slug: "windshield-repair", skillLevels: ["Artisan", "Technician"] },
      { name: "Tyre & wheel services", slug: "tyre-wheel", skillLevels: ["Artisan", "Technician"] },
      { name: "Battery replacement", slug: "battery-replacement", skillLevels: ["Basic", "Technician"] },
      { name: "Diagnostic scanning", slug: "diagnostic-scanning", skillLevels: ["Auto Technician", "Certified"] },
    ]
  },
  {
    name: "Cleaning & Environmental Care",
    slug: "cleaning-environmental",
    icon: "🧹",
    description: "Professional cleaning and pest control",
    order: 7,
    services: [
      { name: "Household cleaning", slug: "household-cleaning", skillLevels: ["General Worker", "Professional"] },
      { name: "Office cleaning", slug: "office-cleaning", skillLevels: ["General Worker", "Professional"] },
      { name: "Pest control", slug: "pest-control", skillLevels: ["General Worker", "Certified Pest Handler (NEMA)"] },
      { name: "Fumigation", slug: "fumigation", skillLevels: ["Certified Pest Handler (NEMA)"] },
      { name: "Waste collection & disposal", slug: "waste-collection", skillLevels: ["General Worker"] },
      { name: "Landscaping", slug: "landscaping", skillLevels: ["General Worker", "Professional Landscaper"] },
      { name: "Car wash (mobile)", slug: "car-wash-mobile", skillLevels: ["General Worker", "Professional"] },
    ]
  },
  {
    name: "ICT, Digital & Device Services",
    slug: "ict-digital",
    icon: "💻",
    description: "Technology and digital services",
    order: 8,
    services: [
      { name: "Phone repair", slug: "phone-repair", skillLevels: ["Basic Support", "ICT Technician"] },
      { name: "Laptop repair", slug: "laptop-repair", skillLevels: ["ICT Technician", "IT Specialist"] },
      { name: "Software installation", slug: "software-installation", skillLevels: ["Basic Support", "IT Specialist"] },
      { name: "Internet setup", slug: "internet-setup", skillLevels: ["ICT Technician", "IT Specialist"] },
      { name: "CCTV installation", slug: "cctv-installation", skillLevels: ["ICT Technician", "IT Specialist"] },
      { name: "Smart home systems", slug: "smart-home", skillLevels: ["ICT Technician", "IT Specialist"] },
      { name: "Printer repair", slug: "printer-repair", skillLevels: ["Basic Support", "ICT Technician"] },
      { name: "Graphic design", slug: "graphic-design", skillLevels: ["Basic", "Professional Designer"] },
      { name: "Social media management", slug: "social-media-management", skillLevels: ["Basic", "Professional"] },
    ]
  },
  {
    name: "Events, Hospitality & Entertainment",
    slug: "events-hospitality",
    icon: "🎉",
    description: "Event services and entertainment",
    order: 9,
    services: [
      { name: "Catering services", slug: "catering-services", skillLevels: ["General Worker", "Professional Chef"] },
      { name: "Chef / cook for events", slug: "chef-cook-events", skillLevels: ["Cook", "Professional Chef"] },
      { name: "Wait staff", slug: "wait-staff", skillLevels: ["General Worker", "Professional"] },
      { name: "Event setup crew", slug: "event-setup", skillLevels: ["General Worker"] },
      { name: "DJs", slug: "djs", skillLevels: ["Basic", "Professional DJ"] },
      { name: "Photographers", slug: "photographers", skillLevels: ["Basic", "Professional Photographer"] },
      { name: "Videographers", slug: "videographers", skillLevels: ["Basic", "Professional Videographer"] },
      { name: "Decor & tent setup", slug: "decor-tent", skillLevels: ["General Worker", "Professional"] },
    ]
  },
  {
    name: "Logistics, Errands & Support",
    slug: "logistics-errands",
    icon: "📦",
    description: "Delivery and logistics services",
    order: 10,
    services: [
      { name: "Errand runner", slug: "errand-runner", skillLevels: ["General Worker"] },
      { name: "Delivery rider", slug: "delivery-rider", skillLevels: ["General Worker", "Licensed Rider"] },
      { name: "Messenger services", slug: "messenger-services", skillLevels: ["General Worker"] },
      { name: "Moving & relocation helpers", slug: "moving-relocation", skillLevels: ["General Worker"] },
      { name: "Loader / offloader", slug: "loader-offloader", skillLevels: ["General Worker"] },
      { name: "Personal assistant (ad hoc)", slug: "personal-assistant", skillLevels: ["General Worker", "Professional"] },
    ]
  },
  {
    name: "Health, Therapy & Support",
    slug: "health-therapy",
    icon: "🏥",
    description: "Non-clinical health and wellness services",
    order: 11,
    services: [
      { name: "Physiotherapist (licensed)", slug: "physiotherapist", skillLevels: ["Licensed Practitioner"] },
      { name: "Occupational therapy", slug: "occupational-therapy", skillLevels: ["Certified Practitioner"] },
      { name: "Nutrition coaching", slug: "nutrition-coaching", skillLevels: ["Certified Coach", "Professional"] },
      { name: "Mental wellness coach", slug: "mental-wellness", skillLevels: ["Certified Coach", "Professional"] },
      { name: "Fitness trainer", slug: "fitness-trainer", skillLevels: ["Certified Trainer", "Professional"] },
      { name: "First aid responders", slug: "first-aid", skillLevels: ["Certified Responder"] },
    ]
  },
  {
    name: "Agriculture & Home Food Production",
    slug: "agriculture-food",
    icon: "🌾",
    description: "Agricultural and gardening services",
    order: 12,
    services: [
      { name: "Kitchen garden setup", slug: "kitchen-garden", skillLevels: ["General Worker", "Professional"] },
      { name: "Farm labour", slug: "farm-labour", skillLevels: ["General Worker"] },
      { name: "Poultry structure setup", slug: "poultry-structure", skillLevels: ["General Worker", "Technician"] },
      { name: "Irrigation setup", slug: "irrigation-setup", skillLevels: ["Technician", "Professional"] },
      { name: "Landscaping & tree pruning", slug: "landscaping-tree", skillLevels: ["General Worker", "Professional"] },
    ]
  },
  {
    name: "Business & Professional Freelance",
    slug: "business-professional",
    icon: "💼",
    description: "Professional business services",
    order: 13,
    services: [
      { name: "Accounting", slug: "accounting", skillLevels: ["General Support", "Certified Accountant"] },
      { name: "Bookkeeping", slug: "bookkeeping", skillLevels: ["General Support", "Professional"] },
      { name: "HR support", slug: "hr-support", skillLevels: ["General Support", "Professional"] },
      { name: "Virtual assistants", slug: "virtual-assistants", skillLevels: ["General Support", "Professional"] },
      { name: "Legal clerks (non-advocacy)", slug: "legal-clerks", skillLevels: ["General Support", "Certified"] },
      { name: "Data entry", slug: "data-entry", skillLevels: ["General Support"] },
      { name: "Trainers", slug: "trainers", skillLevels: ["General Support", "Certified Trainer"] },
      { name: "Business consultants", slug: "business-consultants", skillLevels: ["Professional", "Certified"] },
    ]
  },
];

export async function seedServices() {
  console.log('🌱 Starting simple services seed...');

  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.service.deleteMany({});
    await prisma.serviceCategory.deleteMany({});

    // Seed categories and services
    for (const categoryData of servicesData) {
      const { services, ...categoryInfo } = categoryData;

      const category = await prisma.serviceCategory.create({
        data: {
          ...categoryInfo,
          services: {
            create: services.map(service => ({
              name: service.name,
              slug: service.slug,
              skillLevels: service.skillLevels,
            }))
          }
        },
        include: {
          services: true
        }
      });

      console.log(`✅ Created: ${category.icon} ${category.name} (${category.services.length} services)`);
    }

    const totalCategories = await prisma.serviceCategory.count();
    const totalServices = await prisma.service.count();

    console.log(`\n🎉 Seeding complete!`);
    console.log(`📊 Created ${totalCategories} categories`);
    console.log(`📊 Created ${totalServices} services`);

  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedServices()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}