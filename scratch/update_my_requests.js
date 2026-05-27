const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/dashboard/marketplace/my-requests/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update radius display text
const targetSpan = '<span className="text-cyan-400 font-bold bg-cyan-950 px-3 py-1 rounded text-sm">{radius[0]} ק"מ</span>';
const replacementSpan = '<span className="text-cyan-400 font-bold bg-cyan-950 px-3 py-1 rounded text-sm">{radius[0] === 105 ? "ללא הגבלה" : `${radius[0]} ק"מ`}</span>';

if (content.includes(targetSpan)) {
    content = content.replace(targetSpan, replacementSpan);
    console.log('✅ Updated radius display span.');
} else {
    console.log('❌ Could not find radius display span.');
}

// 2. Wrap map button in condition
const targetButton = `                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            onClick={() => setShowMap(true)} 
                                                            disabled={!lat || !lng} 
                                                            className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 px-2 gap-1 rounded-md transition-all border border-blue-500/20"
                                                        >
                                                            <MapIcon className="w-3.5 h-3.5"/> הצג במפה
                                                        </Button>`;

const replacementButton = `                        {radius[0] !== 105 && (
                                                            <Button 
                                                                type="button" 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => setShowMap(true)} 
                                                                disabled={!lat || !lng} 
                                                                className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 px-2 gap-1 rounded-md transition-all border border-blue-500/20"
                                                            >
                                                                <MapIcon className="w-3.5 h-3.5"/> הצג במפה
                                                            </Button>
                                                        )}`;

// Normalize line endings for replacement search
const normalize = s => s.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

const normContent = normalize(content);
const normTargetButton = normalize(targetButton);

if (normContent.includes(normTargetButton)) {
    // Let's do a regex replacement or simpler string replace
    // We will search for the Button block specifically
    const btnRegex = /<Button\s+type="button"\s+variant="ghost"\s+size="sm"\s+onClick=\{\(\)\s*=>\s*setShowMap\(true\)\}\s+disabled=\{\!lat\s*\|\|\s*\!lng\}\s+className="h-8[^"]+"\s*>\s*<MapIcon[^>]*\/>\s*הצג במפה\s*<\/Button>/;
    const match = content.match(btnRegex);
    if (match) {
        content = content.replace(match[0], `{radius[0] !== 105 && (\n    ${match[0]}\n)}`);
        console.log('✅ Wrapped map button in condition.');
    } else {
        console.log('❌ Regex match failed for map button.');
    }
} else {
    console.log('❌ Could not find map button.');
}

// 3. Update Slider
const sliderRegex = /<Slider\s+defaultValue=\{\[25\]\}\s+max=\{100\}\s+min=\{5\}\s+step=\{1\}\s+onValueChange=\{\(v\)\s*=>\s*setRadius\(v\)\}\s+className="w-full"\s*\/>/;
const sliderMatch = content.match(sliderRegex);
if (sliderMatch) {
    const newSlider = `<Slider 
                                                    defaultValue={[25]} 
                                                    max={105} 
                                                    min={5} 
                                                    step={5} 
                                                    value={radius}
                                                    onValueChange={(v) => setRadius(v)} 
                                                    className="w-full"
                                                />`;
    content = content.replace(sliderMatch[0], newSlider);
    console.log('✅ Updated Slider component properties.');
} else {
    console.log('❌ Could not find Slider component.');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done!');
