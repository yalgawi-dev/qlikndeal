import prisma from "../prismadb";

export interface ParseContext {
  category: string; 
  originalText: string;
  anchors?: any[];
  safeValues?: any[];
}

export interface ExtractedField {
  field: string;
  value: string | number;
  confidence: number;
  sourceAnchor?: string;
  sourceDistance?: number;
  tokenIndex?: number;
}

interface TokenMeta {
  index: number;
  word: string;
  isStopWord: boolean;
  isAnchor: boolean;
  anchorDefinitions?: any[];
}

export class ContextAwareParser {
  
  static async parse(context: ParseContext): Promise<ExtractedField[]> {
    const { category, originalText, anchors = [], safeValues = [] } = context;
    let extractedFields: ExtractedField[] = [];

    const stopWords = new Set(["ו", "של", "את", "או", "ב", "ל", "על", "עם", "מ", "כ"]);

    // =========================================================
    // STEP 2: PRE-PROCESSING (Tokenization & Noise Pruning)
    // =========================================================
    const cleanDict = (str: string) => String(str).replace(/[()\[\]{}]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

    // Preserve strong punctuation to create boundaries
    let normalizedText = originalText.toLowerCase()
        .replace(/[\u00ae\u2122\u00a9]/g, ' ') // Strip ®, ™, ©
        .replace(/[\u200b-\u200d\ufeff]/g, ''); // Strip zero-width characters
    
    // Convert hard boundary punctuation to a special token: __wall__
    normalizedText = normalizedText.replace(/[.!;\n|]/g, ' __wall__ ');
    // Commas are softer, but still boundaries for specific specs
    normalizedText = normalizedText.replace(/[,]/g, ' __wall__ ');
    
    // Replace parentheses and brackets with spaces so they don't stick to words
    normalizedText = normalizedText.replace(/[()\[\]{}]/g, ' ');

    // Strip other punctuation but keep boundaries intact
    normalizedText = normalizedText.replace(/[:\-\/]/g, ' ');
    // Collapse multiple spaces
    normalizedText = normalizedText.replace(/\s+/g, ' ').trim();

    // Find all multi-word phrases from dictionary
    const multiWordPhrases = new Set<string>();
    safeValues.forEach(s => {
       const str = cleanDict(s.value);
       if (str.includes(' ')) multiWordPhrases.add(str);
    });
    anchors.forEach(a => {
       const str = cleanDict(a.phrase);
       if (str.includes(' ')) multiWordPhrases.add(str);
    });

    // Also globally blacklist known system anchors from ever becoming generic values
    // Even if the DB ignored them, they should NEVER be "candidate values"
    const GLOBAL_BLACKLIST = new Set(["ram", "ssd", "hdd", "gb", "tb", "ליבות", "זכרון", "רם"]);

    const sortedPhrases = Array.from(multiWordPhrases).sort((a, b) => b.length - a.length);
    
    // Group them in the text using underscores so they become single tokens
    sortedPhrases.forEach(phrase => {
        const escapedPhrase = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Because Hebrew/English word boundaries can be tricky, we pad with spaces logic
        normalizedText = ` ${normalizedText} `.replace(new RegExp(` ${escapedPhrase} `, 'g'), ` ${phrase.replace(/ /g, '_')} `).trim();
    });

    const rawTokens = normalizedText.split(/\s+/).filter(Boolean);

    // Map internal dictionaries to underscored counterparts
    const internalSafeValues = safeValues.map(s => ({
        ...s,
        value: cleanDict(s.value).replace(/ /g, '_')
    }));

    const internalAnchors = anchors.map(a => ({
        ...a,
        phrase: cleanDict(a.phrase).replace(/ /g, '_')
    }));

    const tokens: TokenMeta[] = rawTokens.map((word, index) => {
      const isStopWord = stopWords.has(word);
      // Group all anchor patterns that match this word
      const anchorMatches = internalAnchors.filter(a => {
         if (a.phrase === word) return true;
         // Root cause fix: Handle Hebrew prefixes (e.g. במעבד -> מעבד)
         if (word.length > a.phrase.length) {
             const prefix = word.slice(0, word.length - a.phrase.length);
             if (/^[וכהבלמש]{1,2}-?$/.test(prefix) && word.endsWith(a.phrase)) {
                 return true;
             }
         }
         return false;
      });
      return {
        index,
        word,
        isStopWord,
        isAnchor: anchorMatches.length > 0 || GLOBAL_BLACKLIST.has(word),
        anchorDefinitions: anchorMatches.length > 0 ? anchorMatches : undefined
      };
    });

    // Value Candidates are strictly words that are neither StopWords nor Anchors.
    // They are the "Unknown" words that the AI will try to zero-shot guess based on anchor proximity.
    // ZERO DATA LEAKAGE: An anchor or globally blacklisted word can NEVER be treated as a value.
    const candidateValues = tokens.filter(t => 
        !t.isStopWord && 
        !t.isAnchor && 
        t.word !== '__wall__'
    );
    const consumedIndices = new Set<number>();

    // =========================================================
    // STEP 3: "CANDLES" (SAFE VALUES - STANDALONE)
    // =========================================================
    // ─── HIERARCHY FIX ───────────────────────────────────────
    // A Candle is a validated term with an EXPLICIT field owner.
    // When a token is a known Candle for field X, it:
    //   (a) is emitted ONLY for field X — no cross-field bleeding.
    //   (b) is locked (consumedIndices) so STEP 4 anchors cannot
    //       re-assign it to a different field via proximity.
    //
    // DEDUP RULE: If the DB erroneously has the same value linked
    // to multiple fields, we emit for ALL of them here and let
    // War of Families (STEP 5) resolve — but we still lock the
    // token so anchors cannot add a 3rd, unconstrained claim.
    // ─────────────────────────────────────────────────────────
    //
    // Build a field-scoped "ownership" index: token.index → Set<fieldId>
    // This prevents STEP 4 from touching tokens already owned by a Candle.
    const candleOwnership = new Map<number, Set<string>>();

    // ─── STEP 3 FIX ───────────────────────────────────────────────────────────
    // CRITICAL: Candle matching MUST check ALL tokens, not just candidateValues.
    // A word like "dell" or "latitude" can be BOTH an anchor (guides direction)
    // AND a candle value (is the actual brand/family name).
    // Previously: anchor tokens were excluded from candidateValues → candles never matched.
    // Fix: Iterate all non-wall tokens; only skip GLOBAL_BLACKLIST words.
    // ─────────────────────────────────────────────────────────────────────────
    const allMatchableTokens = tokens.filter(t => 
      t.word !== '__wall__' && !GLOBAL_BLACKLIST.has(t.word)
    );

    allMatchableTokens.forEach(token => {
      const tokenWordLower = token.word.replace(/_/g, ' ');

      // Collect ALL candle entries matching this token (may span multiple fields)
      const safeMatches = internalSafeValues.filter(s => {
        if (s.isIgnored) return false;
        // Single-word match (both in space form)
        if (s.value === tokenWordLower) return true;
        // Multi-word match: s.value has underscores ("latitude_5440"), token.word also has underscores
        if (s.value === token.word) return true;
        
        // Root cause fix: Handle Hebrew prefixes for candles too
        if (tokenWordLower.length > s.value.length) {
             const prefix = tokenWordLower.slice(0, tokenWordLower.length - s.value.length);
             if (/^[וכהבלמש]{1,2}-?$/.test(prefix) && tokenWordLower.endsWith(s.value)) {
                 return true;
             }
        }
        return false;
      });

      if (safeMatches.length > 0) {
        const ownedFields = new Set<string>();
        safeMatches.forEach(safeMatch => {
          extractedFields.push({
            field: safeMatch.field,
            value: safeMatch.value.replace(/_/g, ' '),
            confidence: safeMatch.confidence,
            sourceAnchor: "CANDLE_SELF_LIT",
            sourceDistance: 0,
            tokenIndex: token.index
          });
          ownedFields.add(safeMatch.field);
        });
        // LOCK: This token is now "owned" by its Candle fields.
        // STEP 4 must not reassign it to any field outside ownedFields.
        candleOwnership.set(token.index, ownedFields);
        consumedIndices.add(token.index);
      }
    });


    // =========================================================
    // STEP 4: "THE COMPASS" (CANDIDATE EXPLORATION)
    // =========================================================
    // Instead of Anchors scanning outward and stopping at the first find (which can
    // cause them to get distracted by "nonsense" tokens), every Candidate Value looks
    // around itself to gather ALL radiating Anchor evidence in its radius.
    const anchorTokens = tokens.filter(t => t.isAnchor);

    candidateValues.forEach(targetToken => {
      // ─── HIERARCHY GUARD (Candle Ownership) ───────────────────────────
      const isCandleOwned = consumedIndices.has(targetToken.index);
      const ownedFields = candleOwnership.get(targetToken.index);

      // Find all anchors within a max reasonable distance (default 5 to save iterations)
      const nearbyAnchors = anchorTokens.filter(a => Math.abs(a.index - targetToken.index) <= 5);

      nearbyAnchors.forEach(anchorToken => {
        if (!anchorToken.anchorDefinitions) return;

        anchorToken.anchorDefinitions.forEach(anchorDef => {
          const dist = Math.abs(anchorToken.index - targetToken.index);
          const maxDist = anchorDef.maxDistance || 5;

          if (dist > maxDist) return;

          // ─── HARD BOUNDARY (WALL) CHECK ───────────────────────────
          // If there is a __wall__ token between the anchor and the candidate, abort!
          const startIdx = Math.min(anchorToken.index, targetToken.index);
          const endIdx = Math.max(anchorToken.index, targetToken.index);
          let crossedWall = false;
          for (let i = startIdx + 1; i < endIdx; i++) {
              if (tokens[i].word === '__wall__') {
                  crossedWall = true;
                  break;
              }
          }
          if (crossedWall) return; // Strict boundary enforcement

          // Check Direction Expectation
          const dir = anchorDef.expectedDirection; // FORWARD, BACKWARD, BOTH
          const isForward = targetToken.index > anchorToken.index; // Candidate is AFTER Anchor
          
          if (dir === "FORWARD" && !isForward) return;
          if (dir === "BACKWARD" && isForward) return;

          // ─── HIERARCHY GUARD (Cross-Field Bleeding) ───────────────────
          if (isCandleOwned && ownedFields) {
            const anchorFields: string[] = anchorDef.relatedFields || [];
            const isFullyAligned = anchorFields.every((f: string) => ownedFields.has(f));
            if (!isFullyAligned) return; // Hard block — hierarchy violation
          }

          // Type Expectation check
          const isExpectedNumber = anchorDef.expectedType === "NUMBER";
          // Strip Hebrew prefixes like ב-, כ-, ל-, מ- (optionally with dash)
          const strippedTargetWord = targetToken.word.replace(/^[בכלמ]-?/, '');
          const parsedNum = parseFloat(strippedTargetWord);
          const isNumeric = !isNaN(parsedNum);
          const isPureNum = /^\d+(?:\.\d+)?$/.test(strippedTargetWord);
          const fieldType = (anchorDef.relatedFields[0] || "").toLowerCase();

          // ─── CURRENCY SHIELD (מגן מטבע) ───────────────────────────────────
          // If a number (even with attached symbols) has currency near or inside it, block from catalog specs.
          if (isNumeric) {
            const nextTk = tokens[targetToken.index + 1];
            const prevTk = tokens[targetToken.index - 1];
            const currencySymbols = ['שח', 'שקל', 'nis', '₪', '$', 'ש"ח', 'שקלים'];
            const isCurrencyNext = nextTk && currencySymbols.includes(nextTk.word);
            const isCurrencyPrev = prevTk && currencySymbols.includes(prevTk.word);
            const hasEmbeddedCurrency = targetToken.word.includes('₪') || targetToken.word.includes('$') || targetToken.word.includes('שח') || targetToken.word.includes('ש"ח');
            
            if (isCurrencyNext || isCurrencyPrev || hasEmbeddedCurrency) {
              return; // Absolutely block this claim.
            }
          }

          // ─── STRICT DOMAIN VALIDATION (No Band-Aids!) ──────────────────
          // A subModel (like Laptop Model) shouldn't be a random distant small number (like 14).
          // It can only be a number if it's strictly adjacent (distance=1) OR if it's over 100 (like Peugeot 208).
          if (fieldType === 'submodel' && isPureNum) {
              if (dist > 1 && parsedNum < 100) return; // Prevent grabbing '14' from a distant word
          }

          // Generic restriction: Pure numbers are generally invalid as standalone text for brand/cpu/os/family
          if (['brand', 'cpu', 'os', 'color', 'condition', 'family', 'series'].includes(fieldType) && isPureNum) {
              if (dist > 1) return; // Must be strictly adjacent to be considered a model number variant
          }

          if ((isExpectedNumber && isNumeric) || (anchorDef.expectedType === "TEXT" && !isNumeric) || (!anchorDef.expectedType)) {
             
             const distancePenalty = Math.max(0.4, 1 - (dist * 0.15));

             // ── Per-field confidence (uses fieldConfidences if available, fallback global) ──
             const fc = (anchorDef.fieldConfidences as Record<string, number>) || {};
             // Note: relField is resolved per-iteration in fieldsToEmit loop below
             // We'll use global for now, override per-field in emit loop
             const baseGlobalConf = Math.max(anchorDef.confidence || 0.2, 0.3);
             const calculatedConfidence = baseGlobalConf * distancePenalty;

             // ─── CANDLE FIELD-SCOPE CHECK ─────────────────────────────────
             const tokenWordLower = targetToken.word.replace(/_/g, ' ');
             const candleEntry = internalSafeValues.find(
               (s: any) => s.value === tokenWordLower && !s.isIgnored
             );
             if (candleEntry) {
               const anchorClaims: string[] = anchorDef.relatedFields || [];
               const anyValidClaim = anchorClaims.some((f: string) => {
                 return internalSafeValues.some(
                   (s: any) => s.value === tokenWordLower && s.field === f && !s.isIgnored
                 );
               });
               if (!anyValidClaim) return;
             }

             // Emit for valid fields
             const fieldsToEmit: string[] = (anchorDef.relatedFields as string[]).filter((relField: string) => {
               if (!candleEntry) return true; 
               return internalSafeValues.some(
                 (s: any) => s.value === tokenWordLower && s.field === relField && !s.isIgnored
               );
             });

             fieldsToEmit.forEach((relField: string) => {
                // Use per-field confidence if available, fallback to global
                const fc = (anchorDef.fieldConfidences as Record<string, number>) || {};
                const perFieldConf = fc[relField] ?? (anchorDef.confidence || 0.2);
                const perFieldBaseConf = Math.max(perFieldConf, 0.3);
                const perFieldFinalConf = perFieldBaseConf * distancePenalty;

                extractedFields.push({
                   field: relField,
                   value: isNumeric ? parsedNum : targetToken.word.replace(/_/g, ' '),
                   confidence: perFieldFinalConf,
                   sourceAnchor: anchorDef.phrase.replace(/_/g, ' '),
                   sourceDistance: dist,
                   tokenIndex: targetToken.index
                });
             });
          }
        });
      });
    });

    // =========================================================
    // STEP 4.5: TOKEN WARS (TOKEN COLLISION RESOLUTION)
    // =========================================================
    // If a generic token was claimed by multiple different anchors (e.g. "5500" claimed
    // by a price anchor and a ram anchor), give the token ONLY to the highest confidence claim.
    // Candles (from Step 3) lock the token for their fields so they bypass this reduction.
    const claimsByToken = new Map<number, ExtractedField[]>();
    extractedFields.forEach(entry => {
      if (entry.tokenIndex === undefined) return;
      const list = claimsByToken.get(entry.tokenIndex) || [];
      list.push(entry);
      claimsByToken.set(entry.tokenIndex, list);
    });

    let resolvedTokensFields: ExtractedField[] = [];

    claimsByToken.forEach((claims, tokenIndex) => {
      // Are there any Candles claiming this token?
      const candleClaims = claims.filter(c => c.sourceAnchor === "CANDLE_SELF_LIT");
      
      if (candleClaims.length > 0) {
        // Token is locked by a Candle. We keep the absolute best Candle claim 
        // to prevent duplicate fields from a single token (e.g. "Intel Core i5" into both cpu and subModel).
        const bestCandle = candleClaims.reduce((prev, current) => 
            (prev.confidence > current.confidence) ? prev : current
        );
        resolvedTokensFields.push(bestCandle);
        return;
      }

      // 1. Group anchor claims by FIELD to unite allies.
      // Anchors that point to the SAME field don't fight - they are a combined force!
      const alliedClaimsByField = new Map<string, ExtractedField>();
      
      claims.forEach(claim => {
        const existing = alliedClaimsByField.get(claim.field);
        if (existing) {
          // They are allies! Unite their power using probability combination:
          // P(A or B) = 1 - ((1 - P(A)) * (1 - P(B)))
          existing.confidence = 1 - ((1 - existing.confidence) * (1 - claim.confidence));
          existing.sourceAnchor = `${existing.sourceAnchor} & ${claim.sourceAnchor}`;
          // sourceDistance can be taken as the minimum (closest) distance
          if (claim.sourceDistance !== undefined && existing.sourceDistance !== undefined) {
             existing.sourceDistance = Math.min(existing.sourceDistance, claim.sourceDistance);
          }
        } else {
          alliedClaimsByField.set(claim.field, { ...claim });
        }
      });

      // 2. ════ CROWN WAR — Coalition Scan ════
      // When multiple fields compete for the same token, witness anchors in the
      // ±2-token window vote to break the tie using the Bayesian multiplicative formula.
      const groupedClaims = Array.from(alliedClaimsByField.values());
      
      if (groupedClaims.length === 1) {
        resolvedTokensFields.push(groupedClaims[0]);
      } else {
        // ── Step 1: Find witness anchors in ±2 token window ──────────────────
        const tokenIdx = groupedClaims[0].tokenIndex ?? 0;
        const WITNESS_WINDOW = 2;
        const MIN_OCC_K = 5; // Laplace smoothing (matches pruner MIN_OCC)

        const witnessAnchorTokens = anchorTokens.filter(a => {
            const d = Math.abs(a.index - tokenIdx);
            return d > 0 && d <= WITNESS_WINDOW && !!a.anchorDefinitions;
        });

        // ── Step 2: WitnessBoost per field using Probabilistic OR ─────────────
        const fieldWitnessBoosts = new Map<string, number>();
        groupedClaims.forEach(claim => {
            const field = claim.field;
            const wScores: number[] = [];

            witnessAnchorTokens.forEach(wATok => {
                (wATok.anchorDefinitions || []).forEach((wDef: any) => {
                    if (wDef.isIgnored) return;
                    const wFC = (wDef.fieldConfidences as Record<string, number>) || {};
                    const wRelatedFields: string[] = wDef.relatedFields || [];

                    let witnessFieldConf: number;
                    if (wFC[field] !== undefined) {
                        witnessFieldConf = wFC[field]; // per-field (accurate)
                    } else if (wRelatedFields.includes(field)) {
                        // Fallback: split evenly (penalizes multi-field witnesses)
                        witnessFieldConf = (wDef.confidence || 0.2) / Math.max(1, wRelatedFields.length);
                    } else {
                        return; // witness doesn't point to this field at all
                    }

                    const occ = wDef.occurrenceCount || 1;
                    const reliability = occ / (occ + MIN_OCC_K);
                    wScores.push(witnessFieldConf * reliability);
                });
            });

            // Probabilistic OR: P(at least one witness correct)
            const witnessBoost = wScores.length > 0
                ? 1 - wScores.reduce((product, ws) => product * (1 - ws), 1)
                : 0;
            fieldWitnessBoosts.set(field, witnessBoost);
        });

        // ── Step 3: α — how much do witnesses matter? ────────────────────────
        const maxBoost = Math.max(...Array.from(fieldWitnessBoosts.values()), 0);
        const PRIOR_INERTIA = 0.5; // how hard it is for witnesses to override prior history
        const alpha = maxBoost / (maxBoost + PRIOR_INERTIA);

        // ── Step 4: FinalScore = Prior × (1 + α × WitnessBoost), then normalize ──
        let totalCrownScore = 0;
        const crownScores = new Map<string, number>();
        groupedClaims.forEach(claim => {
            const prior = claim.confidence; // combined ally confidence = our Prior
            const boost = fieldWitnessBoosts.get(claim.field) || 0;
            const score = prior * (1 + alpha * boost);
            crownScores.set(claim.field, score);
            totalCrownScore += score;
        });

        // ── Step 5: Normalize & elect winner ─────────────────────────────────
        let winnerField = '';
        let winnerNormConf = 0;
        crownScores.forEach((score, field) => {
            const normConf = totalCrownScore > 0 ? score / totalCrownScore : 0;
            if (normConf > winnerNormConf) {
                winnerNormConf = normConf;
                winnerField = field;
            }
        });

        const winnerClaim = alliedClaimsByField.get(winnerField);
        if (winnerClaim) {
            winnerClaim.confidence = winnerNormConf;
            resolvedTokensFields.push(winnerClaim);
        }
      }
    });

    extractedFields = resolvedTokensFields;

    // =========================================================
    // STEP 5: WAR OF FAMILIES (FIELD RESOLUTION)
    // =========================================================
    // Resolution rules (in priority order):
    //   1. CANDLE_SELF_LIT always beats an ANCHOR for the same field.
    //      A validated Candle is ground truth — no proximity guess can override it.
    //   2. Among two ANCHOR sources, pick the higher confidence.
    //   3. Among two CANDLE sources (same value, different DB rows), pick higher confidence.
    // This prevents the "Flat Dictionary Collapse" where a high-weight number
    // (e.g. "32GB" in ram) is overridden by a nearby anchor for brand.
    const finalMap = new Map<string, ExtractedField>();

    extractedFields.forEach(entry => {
      const existing = finalMap.get(entry.field);
      if (!existing) {
        finalMap.set(entry.field, entry);
        return;
      }

      const existingIsCandle = existing.sourceAnchor === "CANDLE_SELF_LIT";
      const incomingIsCandle = entry.sourceAnchor === "CANDLE_SELF_LIT";

      if (existingIsCandle && !incomingIsCandle) {
        // Candle already holds this field — anchor cannot displace it
        return;
      }
      if (!existingIsCandle && incomingIsCandle) {
        // Incoming Candle displaces an anchor entry
        finalMap.set(entry.field, entry);
        return;
      }
      // Both same type → higher confidence wins
      if (entry.confidence > existing.confidence) {
        finalMap.set(entry.field, entry);
      }
    });

    return Array.from(finalMap.values());
  }
}
