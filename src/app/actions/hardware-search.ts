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

export async function getAutocomplete(query: string, category: string, subCategory?: string) {
    const q = query.trim();
    if (!q) return [];

    let results: string[] = [];
    if (category === "Computers") {
        const fetchLimit = 20;
        
        // Determine which tables to search based on subCategory
        const typesToSearch = subCategory 
            ? [subCategory] 
            : ["laptop", "desktop", "aio"];

        if (typesToSearch.includes("laptop")) {
            const laptopMatches = await prisma.laptopCatalog.findMany({
                where: {
                    OR: [
                        { brand: { startsWith: q, mode: 'insensitive' } },
                        { modelName: { startsWith: q, mode: 'insensitive' } },
                        { sku: { startsWith: q, mode: 'insensitive' } },
                    ]
                },
                take: fetchLimit,
                select: { brand: true, modelName: true }
            });
            
            let currentLaptops = [...laptopMatches];
            if (currentLaptops.length < fetchLimit) {
                const more = await prisma.laptopCatalog.findMany({
                    where: {
                        AND: [
                            { OR: [
                                { brand: { contains: q, mode: 'insensitive' } },
                                { modelName: { contains: q, mode: 'insensitive' } },
                                { sku: { contains: q, mode: 'insensitive' } },
                            ]},
                            { NOT: { brand: { startsWith: q, mode: 'insensitive' } } },
                            { NOT: { modelName: { startsWith: q, mode: 'insensitive' } } }
                        ]
                    },
                    take: fetchLimit - currentLaptops.length,
                    select: { brand: true, modelName: true }
                });
                currentLaptops = [...currentLaptops, ...more];
            }
            results.push(...currentLaptops.map(l => l.modelName.toLowerCase().includes(l.brand.toLowerCase()) ? l.modelName : `${l.brand} ${l.modelName}`));
        }

        if (typesToSearch.includes("desktop")) {
            const desktopMatches = await prisma.brandDesktopCatalog.findMany({
                where: {
                    OR: [
                        { brand: { contains: q, mode: 'insensitive' } },
                        { modelName: { contains: q, mode: 'insensitive' } },
                    ]
                },
                take: 10
            });
            results.push(...desktopMatches.map(d => d.modelName.toLowerCase().includes(d.brand.toLowerCase()) ? d.modelName : `${d.brand} ${d.modelName}`));
        }

        if (typesToSearch.includes("aio")) {
            const aioMatches = await prisma.aioCatalog.findMany({
                where: {
                    OR: [
                        { brand: { contains: q, mode: 'insensitive' } },
                        { modelName: { contains: q, mode: 'insensitive' } },
                    ]
                },
                take: 10
            });
            results.push(...aioMatches.map(a => a.modelName.toLowerCase().includes(a.brand.toLowerCase()) ? a.modelName : `${a.brand} ${a.modelName}`));
        }
    } else if (category === "Phones") {
        const mobiles = await prisma.mobileCatalog.findMany({
            where: {
              OR: [
                { brand: { contains: q, mode: 'insensitive' } },
                { modelName: { contains: q, mode: 'insensitive' } },
                { hebrewAliases: { has: q } }
              ]
            },
            take: 15
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
            take: 15
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
            take: 15
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
            take: 15
        });
        results = items.map(i => i.modelName.toLowerCase().includes(i.brand.toLowerCase()) ? i.modelName : `${i.brand} ${i.modelName}`);
    }

    // Final Sort: Prioritize results starting with the query, then alphabetical
    const sortedResults = Array.from(new Set(results)).sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const qLower = q.toLowerCase();
        
        const aStarts = aLower.startsWith(qLower);
        const bStarts = bLower.startsWith(qLower);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        // Special case for numbers in strings (e.g., iPhone 13 vs iPhone 14)
        return a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' });
    });
    
    return sortedResults.slice(0, 15);
}

export async function getUniqueFamilies(type: "laptop" | "desktop" | "aio", brand?: string) {
    try {
        let families: string[] = [];
        const where: any = {};
        if (brand) where.brand = brand;

        if (type === "laptop") {
            const raw = await prisma.laptopCatalog.findMany({
                where,
                select: { series: true },
                distinct: ['series']
            });
            families = raw.map(r => r.series).filter(Boolean);
        } else if (type === "desktop") {
            const raw = await prisma.brandDesktopCatalog.findMany({
                where,
                select: { series: true },
                distinct: ['series']
            });
            families = raw.map(r => r.series).filter(Boolean);
        } else if (type === "aio") {
            const raw = await prisma.aioCatalog.findMany({
                where,
                select: { series: true },
                distinct: ['series']
            });
            families = raw.map(r => r.series).filter(Boolean);
        }
        return { success: true, families: families.sort() };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getModelsByFamily(type: "laptop" | "desktop" | "aio", brand?: string, family?: string) {
    try {
        let models: any[] = [];
        const where: any = {};
        if (brand) where.brand = brand;
        if (family) where.series = family;

        if (type === "laptop") {
            models = await prisma.laptopCatalog.findMany({
                where,
                take: 50 // Limit when no filter to avoid huge payload
            });
        } else if (type === "desktop") {
            models = await prisma.brandDesktopCatalog.findMany({
                where,
                take: 50
            });
        } else if (type === "aio") {
            models = await prisma.aioCatalog.findMany({
                where,
                take: 50
            });
        }
        
        return { 
            success: true, 
            models: models.map(m => ({
                id: m.id,
                brand: m.brand,
                series: m.series,
                name: m.modelName,
                sku: m.sku,
                cpu: m.cpu,
                ram: m.ram,
                storage: m.storage,
                screenSize: m.screenSize,
                gpu: m.gpu,
                os: m.os,
                weight: m.weight,
                ports: m.ports,
                release_year: m.releaseYear,
                display: m.display
            }))
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
