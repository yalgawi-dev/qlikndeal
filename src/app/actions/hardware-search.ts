"use server";

import prismadb from "@/lib/prismadb";

const prisma = prismadb;

export async function searchLaptops(query: string) {
  const q = query.trim();
  if (!q) return [];

  const results = await prisma.laptopCatalog.findMany({
    where: {
      OR: [
        { brand: { contains: q, mode: 'insensitive' } },
        { series: { contains: q, mode: 'insensitive' } },
        { modelName: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ]
    },
    take: 20
  });

  return results.map(r => ({
    brand: r.brand,
    model: r.modelName,
    series: r.series,
    type: r.type || "laptop",
    cpu: r.cpu?.[0] || "",
    ram: r.ram?.[0] || "",
    storage: r.storage?.[0] || "",
    screen: r.screenSize?.[0] || "",
    gpu: r.gpu?.[0] || "",
    os: r.os?.[0] || "",
    year: r.releaseYear || "",
    notes: r.notes || "",
    sku: r.sku || ""
  }));
}

export async function searchBrandDesktops(query: string) {
  const q = query.trim();
  if (!q) return [];

  const results = await prisma.brandDesktopCatalog.findMany({
    where: {
      OR: [
        { brand: { contains: q, mode: 'insensitive' } },
        { series: { contains: q, mode: 'insensitive' } },
        { modelName: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ]
    },
    take: 20
  });

  return results.map(r => ({
    brand: r.brand,
    model: r.modelName,
    series: r.series,
    type: "desktop",
    cpu: r.cpu?.[0] || "",
    ram: r.ram?.[0] || "",
    storage: r.storage?.[0] || "",
    screen: "",
    gpu: r.gpu?.[0] || "",
    os: r.os?.[0] || "",
    year: r.releaseYear || "",
    notes: r.notes || "",
    sku: r.sku || ""
  }));
}

export async function searchAio(query: string) {
    const q = query.trim();
    if (!q) return [];
  
    const results = await prisma.aioCatalog.findMany({
      where: {
        OR: [
          { brand: { contains: q, mode: 'insensitive' } },
          { series: { contains: q, mode: 'insensitive' } },
          { modelName: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 20
    });
  
    return results.map(r => ({
      brand: r.brand,
      model: r.modelName,
      series: r.series,
      type: "aio",
      cpu: r.cpu?.[0] || "",
      ram: r.ram?.[0] || "",
      storage: r.storage?.[0] || "",
      screen: r.screenSize?.[0] || "",
      gpu: r.gpu?.[0] || "",
      os: r.os?.[0] || "",
      year: r.releaseYear || "",
      notes: r.notes || "",
      sku: r.sku || ""
    }));
}

export async function searchMobile(query: string) {
    const q = query.trim();
    if (!q) return [];
  
    const results = await prisma.mobileCatalog.findMany({
      where: {
        OR: [
          { brand: { contains: q, mode: 'insensitive' } },
          { series: { contains: q, mode: 'insensitive' } },
          { modelName: { contains: q, mode: 'insensitive' } },
          { hebrewAliases: { has: q } }
        ]
      },
      take: 20
    });
  
    return results.map(r => ({
      brand: r.brand,
      model: r.modelName,
      series: r.series,
      type: "mobile",
      cpu: r.cpu || "",
      ram: r.ramG ? `${r.ramG}GB` : "",
      storage: r.storages.join(" / "),
      screen: r.screenSize ? `${r.screenSize}"` : "",
      year: r.releaseYear?.toString() || "",
      battery: r.battery || "",
      cameras: `${r.rearCamera} / ${r.frontCamera}`,
      sku: ""
    }));
}

export async function searchVehicles(query: string) {
    const q = query.trim();
    if (!q) return [];
  
    const results = await prisma.vehicleCatalog.findMany({
      where: {
        OR: [
          { make: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 20
    });
  
    return results.map(r => ({
      make: r.make,
      model: r.model,
      year: r.year?.toString() || "",
      type: r.type || "",
      fuel: r.fuelType || "",
      transmission: r.transmission || "",
      engineSize: r.engineSize || "",
      hp: r.hp?.toString() || ""
    }));
}

export async function searchElectronics(query: string) {
    const q = query.trim();
    if (!q) return [];
  
    const results = await prisma.electronicsCatalog.findMany({
      where: {
        OR: [
          { brand: { contains: q, mode: 'insensitive' } },
          { modelName: { contains: q, mode: 'insensitive' } },
          { hebrewAliases: { has: q } }
        ]
      },
      take: 20
    });
  
    return results.map(r => ({
      brand: r.brand,
      model: r.modelName,
      category: r.category,
      year: r.releaseYear?.toString() || "",
      specs: r.specs ? JSON.parse(r.specs) : {}
    }));
}

export async function searchAppliances(query: string) {
    const q = query.trim();
    if (!q) return [];
  
    const results = await prisma.applianceCatalog.findMany({
      where: {
        OR: [
          { brand: { contains: q, mode: 'insensitive' } },
          { modelName: { contains: q, mode: 'insensitive' } },
          { hebrewAliases: { has: q } }
        ]
      },
      take: 20
    });
  
    return results.map(r => ({
      brand: r.brand,
      model: r.modelName,
      category: r.category,
      capacity: r.capacity || "",
      energyRating: r.energyRating || ""
    }));
}

export async function searchMotherboards(query: string) {
    const q = query.trim();
    if (!q) return [];
  
    const results = await prisma.motherboardCatalog.findMany({
      where: {
        OR: [
          { brand: { contains: q, mode: 'insensitive' } },
          { model: { contains: q, mode: 'insensitive' } },
          { chipset: { contains: q, mode: 'insensitive' } },
          { socket: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 20
    });
  
    return results;
}

export async function getAutocomplete(query: string, category: string) {
    const q = query.trim();
    if (!q) return [];

    let results: string[] = [];
    if (category === "Computers") {
        const laptops = await prisma.laptopCatalog.findMany({
            where: {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
              ]
            },
            take: 10
        });

        const desktops = await prisma.brandDesktopCatalog.findMany({
            where: {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
              ]
            },
            take: 5
        });

        const aios = await prisma.aioCatalog.findMany({
            where: {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
              ]
            },
            take: 5
        });

        results = [
            ...laptops.map(l => l.modelName.toLowerCase().includes(l.brand.toLowerCase()) ? l.modelName : `${l.brand} ${l.modelName}`),
            ...desktops.map(d => d.modelName.toLowerCase().includes(d.brand.toLowerCase()) ? d.modelName : `${d.brand} ${d.modelName}`),
            ...aios.map(a => a.modelName.toLowerCase().includes(a.brand.toLowerCase()) ? a.modelName : `${a.brand} ${a.modelName}`)
        ];
    } else if (category === "Phones") {
        const mobiles = await prisma.mobileCatalog.findMany({
            where: {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
                { hebrewAliases: { has: q } }
              ]
            },
            take: 10
        });
        results = mobiles.map(m => m.modelName.toLowerCase().includes(m.brand.toLowerCase()) ? m.modelName : `${m.brand} ${m.modelName}`);
    } else if (category === "Vehicles") {
        const vehicles = await prisma.vehicleCatalog.findMany({
            where: {
              OR: [
                { make: { contains: q, mode: 'insensitive' } },
                { model: { contains: q, mode: 'insensitive' } },
              ]
            },
            take: 10
        });
        results = vehicles.map(v => `${v.make} ${v.model}`);
    } else if (category === "Electronics") {
        const items = await prisma.electronicsCatalog.findMany({
            where: {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
                { hebrewAliases: { has: q } }
              ]
            },
            take: 10
        });
        results = items.map(i => i.modelName.toLowerCase().includes(i.brand.toLowerCase()) ? i.modelName : `${i.brand} ${i.modelName}`);
    } else if (category === "Appliances") {
        const items = await prisma.applianceCatalog.findMany({
            where: {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
                { hebrewAliases: { has: q } }
              ]
            },
            take: 10
        });
        results = items.map(i => i.modelName.toLowerCase().includes(i.brand.toLowerCase()) ? i.modelName : `${i.brand} ${i.modelName}`);
    }
    
    return Array.from(new Set(results)).slice(0, 10);
}
