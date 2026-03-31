import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const fields = [
        {
            category: "LAPTOPS",
            fieldId: "batteryHealth",
            labelHera: "בריאות סוללה",
            fieldType: "select",
            sectionName: "מצב כללי",
            order: 2,
            icon: "Settings",
            options: ["מצוין (90-100%)", "טוב מאוד (80-90%)", "סביר (70-80%)", "דורשת החלפה"]
        },
        {
            category: "LAPTOPS",
            fieldId: "condition",
            labelHera: "סטטוס המוצר (מצב)",
            fieldType: "select",
            sectionName: "מצב כללי",
            order: 1,
            icon: "Settings",
            options: ["חדש באריזה", "כמו חדש (שומש קלות)", "משומש במצב טוב", "משומש עם פגמים"]
        }
    ];

    for (const field of fields) {
        await prisma.categoryFormStructure.upsert({
            where: {
                category_fieldId: {
                    category: field.category,
                    fieldId: field.fieldId
                }
            },
            update: {
                labelHera: field.labelHera,
                fieldType: field.fieldType,
                sectionName: field.sectionName,
                order: field.order,
                icon: field.icon
            },
            create: {
                category: field.category,
                fieldId: field.fieldId,
                labelHera: field.labelHera,
                fieldType: field.fieldType,
                sectionName: field.sectionName,
                order: field.order,
                icon: field.icon
            }
        });

        // Add options if it's a select
        for (const opt of field.options) {
            await prisma.formFieldOption.upsert({
                where: {
                    category_fieldId_value: {
                        category: field.category,
                        fieldId: field.fieldId,
                        value: opt
                    }
                },
                update: {},
                create: {
                    category: field.category,
                    fieldId: field.fieldId,
                    value: opt
                }
            });
        }
    }
    console.log("Added missing fields to LAPTOPS category!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
