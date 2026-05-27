// @ts-nocheck
import { ImageResponse } from "next/og";
import prismadb from "@/lib/prismadb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs"; // Prisma requires Node.js runtime

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    const listing = await prismadb.marketplaceListing.findUnique({
        where: { id },
        select: { title: true, price: true, images: true, condition: true, category: true, extraData: true }
    }).catch(() => null);

    if (!listing) return new Response("Not found", { status: 404 });

    // Parse images — skip base64 (too large for OG gen)
    const images: string[] = JSON.parse(listing.images || "[]");
    const mainImage = images.find(img => img.startsWith("http")) || null;

    // Parse specs from extraData
    let ram = "", cpu = "", storage = "", gpu = "";
    try {
        const extra = JSON.parse(listing.extraData || "{}");
        // Handle both array-of-pairs and object formats
        if (Array.isArray(extra)) {
            extra.forEach((item: any) => {
                const k = (item.key || "").toLowerCase();
                if (k.includes("ram") || k.includes("זיכרון")) ram = item.value;
                if (k.includes("cpu") || k.includes("מעבד")) cpu = item.value;
                if (k.includes("storage") || k.includes("אחסון") || k.includes("ssd")) storage = item.value;
                if (k.includes("gpu") || k.includes("מסך") || k.includes("כרטיס")) gpu = item.value;
            });
        } else {
            ram = extra.ram || extra.RAM || "";
            cpu = extra.cpu || extra.CPU || "";
            storage = extra.storage || extra.Storage || extra.ssd || "";
            gpu = extra.gpu || extra.GPU || "";
        }
    } catch {}

    const conditionLabel =
        listing.condition === "New" ? "חדש" :
        listing.condition === "Like New" ? "כמו חדש" :
        listing.condition === "Used" ? "משומש" : listing.condition;

    const truncTitle = listing.title.length > 42
        ? listing.title.substring(0, 42) + "…"
        : listing.title;

    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    width: "1200px",
                    height: "630px",
                    background: "linear-gradient(135deg, #07071a 0%, #0d0d2b 60%, #07071a 100%)",
                    overflow: "hidden",
                    fontFamily: "sans-serif",
                    position: "relative",
                }}
            >
                {/* Neon glow blobs */}
                <div style={{
                    position: "absolute", top: "-120px", right: "-80px",
                    width: "450px", height: "450px",
                    background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
                    borderRadius: "50%", display: "flex"
                }} />
                <div style={{
                    position: "absolute", bottom: "-120px", left: "-80px",
                    width: "350px", height: "350px",
                    background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)",
                    borderRadius: "50%", display: "flex"
                }} />
                {/* Grid pattern */}
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: "radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.04) 1.5px, transparent 0)",
                    backgroundSize: "28px 28px",
                    display: "flex"
                }} />

                {/* Left: Content */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "56px 64px",
                    flex: 1,
                    position: "relative",
                    zIndex: 10,
                }}>
                    {/* Category + Condition Badge */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        background: "rgba(99,102,241,0.18)",
                        border: "1px solid rgba(99,102,241,0.45)",
                        borderRadius: "50px", padding: "5px 18px",
                        marginBottom: "22px", width: "fit-content",
                    }}>
                        <span style={{ color: "#a5b4fc", fontSize: "14px", fontWeight: "bold" }}>
                            {listing.category || "מרקטפלייס"} • {conditionLabel}
                        </span>
                    </div>

                    {/* Title */}
                    <div style={{
                        color: "white", fontSize: "40px", fontWeight: "900",
                        lineHeight: 1.2, marginBottom: "14px", maxWidth: "540px",
                        textShadow: "0 0 40px rgba(99,102,241,0.3)",
                    }}>
                        {truncTitle}
                    </div>

                    {/* Price */}
                    <div style={{
                        fontSize: "58px", fontWeight: "900",
                        color: "#4ade80", fontFamily: "monospace",
                        marginBottom: "22px",
                        textShadow: "0 0 30px rgba(74,222,128,0.4)",
                    }}>
                        ₪{Number(listing.price).toLocaleString()}
                    </div>

                    {/* Spec Chips */}
                    {(ram || cpu || storage) && (
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "30px" }}>
                            {ram && (
                                <div style={{
                                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                                    borderRadius: "10px", padding: "7px 16px",
                                    color: "#e2e8f0", fontSize: "15px", display: "flex",
                                }}>💾 {ram} RAM</div>
                            )}
                            {cpu && (
                                <div style={{
                                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                                    borderRadius: "10px", padding: "7px 16px",
                                    color: "#e2e8f0", fontSize: "15px", display: "flex",
                                }}>⚡ {cpu}</div>
                            )}
                            {storage && (
                                <div style={{
                                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)",
                                    borderRadius: "10px", padding: "7px 16px",
                                    color: "#e2e8f0", fontSize: "15px", display: "flex",
                                }}>💿 {storage}</div>
                            )}
                        </div>
                    )}

                    {/* Neon CTA Button */}
                    <div style={{
                        display: "flex", alignItems: "center",
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        borderRadius: "16px", padding: "16px 32px",
                        width: "fit-content",
                        boxShadow: "0 0 35px rgba(99,102,241,0.55), 0 4px 15px rgba(0,0,0,0.3)",
                    }}>
                        <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
                            צפה בפרטים ב-Qlikndeal ➔
                        </span>
                    </div>
                </div>

                {/* Right: Product Image */}
                {mainImage ? (
                    <div style={{ display: "flex", width: "420px", height: "630px", position: "relative", flexShrink: 0 }}>
                        <img
                            src={mainImage}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        {/* Left-fade gradient so text doesn't clash */}
                        <div style={{
                            position: "absolute", left: 0, top: 0,
                            width: "120px", height: "100%",
                            background: "linear-gradient(to right, #07071a 0%, transparent 100%)",
                            display: "flex"
                        }} />
                        {/* Neon overlay tint */}
                        <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(to bottom, rgba(7,7,26,0.15), rgba(7,7,26,0.4))",
                            display: "flex"
                        }} />
                    </div>
                ) : (
                    // Fallback: decorative panel
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        width: "380px", flexShrink: 0,
                        background: "rgba(99,102,241,0.08)",
                        borderLeft: "1px solid rgba(99,102,241,0.2)",
                    }}>
                        <div style={{
                            fontSize: "80px", marginBottom: "16px", display: "flex"
                        }}>🖥️</div>
                        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", display: "flex" }}>
                            Qlikndeal
                        </div>
                    </div>
                )}

                {/* Bottom brand */}
                <div style={{
                    position: "absolute", bottom: "20px", left: "64px",
                    color: "rgba(255,255,255,0.3)", fontSize: "13px",
                    display: "flex", alignItems: "center", gap: "6px",
                }}>
                    <span style={{ display: "flex" }}>⚡</span>
                    <span style={{ display: "flex" }}>Qlikndeal • המרקטפלייס הטכנולוגי</span>
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
