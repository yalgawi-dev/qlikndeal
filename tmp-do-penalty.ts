import { masterPenalize } from './src/lib/learning';

async function run() {
    console.log("Simulating UI submit: User changes 'brand' from 'נייד' to 'לנובו'...");
    
    // The system sees that AI suggested "נייד" and user changed it.
    // So it calls masterPenalize("brand", "נייד", "LAPTOPS")
    await masterPenalize('brand', 'נייד', 'LAPTOPS');
    
    console.log("masterPenalize completed. The system should now drop its confidence!");
}

run().catch(console.error);
