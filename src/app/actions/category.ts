"use server";

import prismadb from "@/lib/prismadb";
import { revalidatePath } from "next/cache";

export async function addDynamicCategory(data: {
    code: string;
    nameHebrew: string;
    prismaModel: string;
    nlpKeywords: string[];
    regex: string;
    learnFields: string[];
    uniqueKeys: string[];
}) {
    try {
        const added = await prismadb.dynamicCategory.create({
            data: {
                code: data.code.toUpperCase(),
                nameHebrew: data.nameHebrew,
                prismaModel: data.prismaModel,
                nlpKeywords: data.nlpKeywords,
                regex: data.regex,
                learnFields: data.learnFields,
                uniqueKeys: data.uniqueKeys,
                isActive: true
            }
        });
        revalidatePath('/admin/categories');
        return { success: true, data: added };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
