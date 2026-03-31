import { NextResponse } from "next/server";
import prismadb from "../../../lib/prismadb";
import { masterAnalyze } from "../../../lib/analyze";

export async function POST(req: Request) {
try {
const body = await req.json();
const { text, conversationId, category, senderId } = body;

if (!text || !conversationId) {
  return new NextResponse("Missing fields: text or conversationId", { status: 400 });
}

// 1. שמירת ההודעה בבסיס הנתונים (הלוגיקה הקיימת שלך)
const message = await (prismadb as any).message.create({
  data: {
    content: text,
    conversationId: conversationId,
    senderId: senderId || "user",
  }
});

// 2. חיבור הצינור החכם - שליחת ההודעה לניתוח במנוע שבנינו
// המנוע יחזיר הצעות (כמו שינוי מחיר) אם הוא יזהה תבנית מוכרת
const suggestions = await masterAnalyze(text, category || "general");

// 3. החזרת התשובה לצד הלקוח (Frontend)
// הלקוח יקבל גם את ההודעה שנשמרה וגם את הצעות ה-AI
return NextResponse.json({
  message,
  suggestions
});
} catch (error) {
console.error("[MESSAGES_POST_ERROR]", error);
return new NextResponse("Internal Server Error", { status: 500 });
}
}
