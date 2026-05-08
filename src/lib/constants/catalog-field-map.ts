/**
 * CATALOG_TO_FORM_FIELD_MAP
 * ─────────────────────────────────────────────────────────────
 * Maps LaptopCatalog / external catalog column names
 * → canonical form fieldIds (CategoryFormStructure.fieldId)
 *
 * USE THIS MAP in every catalog seeding/import script
 * when creating FVR (FieldValueReliability) or FormFieldOption entries.
 *
 * WHY: LaptopCatalog DB columns were named independently of the form.
 * The form fieldIds are the CANONICAL names used by the UI, the AI,
 * and the learning system. Translation happens ONCE at import time.
 *
 * NEVER translate at runtime (analyze.ts, learning.ts) —
 * only translate here, at the seeding/import boundary.
 * ─────────────────────────────────────────────────────────────
 */
export const CATALOG_TO_FORM_FIELD_MAP: Record<string, string> = {
  // LaptopCatalog column → form fieldId
  'series':       'family',     // "סדרת יצרן" in form
  'display':      'screen',     // screen specifications → screen field
  'screenSize':   'screen',     // screen size → same screen field
  'modelName':    'subModel',   // full model name → subModel field
  'screenType':   'screenType', // screen type (IPS/OLED) — matches form
  'releaseYear':  'releaseYear',// year of model — matches form
  'type':         'type',       // laptop type (gaming/business) — matches form
  'SKU':          'sku',        // product SKU → lowercase form fieldId
  'BatteryStatus':'batteryHealth', // battery status → batteryHealth
  'שנת דגם':     'releaseYear',// Hebrew alias → releaseYear
  'טכנולוגיית מסך': 'screenType', // Hebrew alias → screenType
  // Direct mappings (column name = form fieldId — no translation needed)
  'brand':    'brand',
  'cpu':      'cpu',
  'ram':      'ram',
  'storage':  'storage',
  'gpu':      'gpu',
  'os':       'os',
  'family':   'family',
  'subModel': 'subModel',
  'condition':'condition',
  'batteryHealth': 'batteryHealth',
};

/**
 * Helper: resolve a catalog column name to its form fieldId.
 * Returns the mapped form fieldId, or the original name if no mapping exists.
 */
export function resolveToFormField(catalogColumnName: string): string {
  return CATALOG_TO_FORM_FIELD_MAP[catalogColumnName] ?? catalogColumnName;
}
