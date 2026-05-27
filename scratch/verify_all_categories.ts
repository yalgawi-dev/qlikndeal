import prismadb from "../src/lib/prismadb";
import { detectCategory } from "../src/lib/matcher-core";

const testCases = [
    {
        text: "מחפש רכב משפחתי טויוטה קורולה במצב מצוין",
        expected: "VEHICLES",
        description: "Standard vehicle query"
    },
    {
        text: "מחשב נייד Lenovo Legion Pro 7i Core i9-14900HX",
        expected: "LAPTOPS",
        description: "Standard laptop query"
    },
    {
        text: "טלפון סלולרי Samsung Galaxy S24 Ultra 512GB",
        expected: "SMARTPHONES",
        description: "Standard smartphone query"
    },
    {
        text: "מחשב נייח Dell OptiPlex 7010 Micro Intel Core i5",
        expected: "DESKTOPS",
        description: "Standard desktop query"
    },
    {
        text: "איימק 24\" iMac 24\" (2024) M4 16GB / 256GB SSD",
        expected: "AIO",
        description: "iMac with 'מורכבות' text should match AIO"
    },
    {
        text: "מחשב אול-אין-ואן Lenovo Yoga AIO 9i Gen 8",
        expected: "AIO",
        description: "Yoga AIO with spaces in keyword should match AIO"
    }
];

async function main() {
    console.log("=== COMPREHENSIVE CATEGORY CLASSIFICATION VERIFICATION ===");
    let allPassed = true;

    for (const tc of testCases) {
        console.log(`\nTesting: "${tc.text}" (${tc.description})`);
        const start = Date.now();
        const detected = await detectCategory(tc.text);
        const duration = Date.now() - start;
        
        const passed = detected === tc.expected;
        console.log(`  Result: ${detected} | Expected: ${tc.expected} | Time: ${duration}ms`);
        if (passed) {
            console.log(`  ✅ PASSED`);
        } else {
            console.log(`  ❌ FAILED`);
            allPassed = false;
        }
    }

    console.log(`\n======================================================`);
    if (allPassed) {
        console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    } else {
        console.log("🚨 SOME TESTS FAILED!");
        process.exit(1);
    }

    await prismadb.$disconnect();
}

main().catch(console.error);
