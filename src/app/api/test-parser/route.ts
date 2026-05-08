import { NextResponse } from "next/server";
import { ContextAwareParser } from "@/lib/parsing/contextAwareParser";
import prismadb from "@/lib/prismadb";

export async function GET() {
  const text = "מכירה עקב גיוס - מחשב גיימינג מפלצת! אסוס רוג סטריקס שנת 2022. דגם G15. מוכר ב-3800 שח סופי בהחלט, לא להתווכח על השקל. שנת 2022 ככה שזה מחיר פצצה. איסוף מראשון לציון או משלוח בתוספת תשלום. לא בשבת.";
  
  const ctx = {
    category: 'LAPTOPS',
    originalText: text,
    anchors: await prismadb.fieldAnchor.findMany({ where: { category: 'LAPTOPS' } }),
    safeValues: await prismadb.fieldValueReliability.findMany({ where: { category: 'LAPTOPS' } })
  };
  
  const res = await ContextAwareParser.parse(ctx);
  return NextResponse.json(res);
}
