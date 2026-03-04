
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vehicles = [
        { make: "טויוטה", model: "קורולה", year: 2022, type: "סדאן", fuelType: "היברידי", transmission: "אוטומט" },
        { make: "טויוטה", model: "יאריס", year: 2021, type: "האצ'בק", fuelType: "בנזין", transmission: "אוטומט" },
        { make: "הונדה", model: "סיוויק", year: 2020, type: "סדאן", fuelType: "בנזין", transmission: "אוטומט" },
        { make: "יונדאי", model: "איוניק", year: 2022, type: "סדאן", fuelType: "היברידי", transmission: "אוטומט" },
        { make: "קיה", model: "ספורטאז'", year: 2023, type: "SUV", fuelType: "בנזין", transmission: "אוטומט" },
        { make: "מאזדה", model: "3", year: 2021, type: "סדאן", fuelType: "בנזין", transmission: "אוטומט" },
        { make: "סקודה", model: "אוקטביה", year: 2022, type: "סדאן", fuelType: "בנזין", transmission: "אוטומט" },
        { make: "טסלה", model: "מודל 3", year: 2023, type: "חשמלי", fuelType: "חשמל", transmission: "אוטומט" }
    ];

    for (const v of vehicles) {
        await prisma.vehicleCatalog.create({ data: v });
    }
    console.log("Added 8 sample vehicles to catalog.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
