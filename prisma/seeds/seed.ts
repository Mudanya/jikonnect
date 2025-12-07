import { initializeAdmin, initializeDefaultSettings } from "../services/queries/admin.query"

import { prisma } from "./prisma.init";

const main = async () => {
    await initializeDefaultSettings()
    await initializeAdmin()
}

main().catch((e) => {
    console.error('❌ Error seeding settings:', e);
    process.exit(1);
})
    .finally(async () => {
        await prisma.$disconnect();
    });