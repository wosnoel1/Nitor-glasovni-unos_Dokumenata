export interface DateParseResult {
  success: boolean;
  date?: string; // DD.MM.GGGG format
  error?: string;
}

// Enhanced formatDateWithDots function - handles multiple input formats
export function formatDateWithDots(rawInput: string): string {
  console.log('🔧 Formatting date with dots:', rawInput);
  
  // Split by various separators and filter empty parts
  const parts = rawInput.trim().split(/[ .,-]/).filter(p => p !== "");
  
  if (parts.length === 3 && parts.every(p => /^\d+$/.test(p))) {
    const [day, month, year] = parts;
    const formatted = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
    console.log('✅ Formatted simple numeric date:', formatted);
    return formatted;
  }
  
  console.log('⚠️ Could not format as simple numeric date, returning original:', rawInput);
  return rawInput; // fallback to original
}

export function parseSpokenDateToNumeric(transcript: string): DateParseResult {
  console.log('🗓️ Parsing spoken date:', transcript);
  
  // First, try simple numeric format like "15 12 1973"
  const simpleFormatted = formatDateWithDots(transcript);
  if (simpleFormatted !== transcript) {
    // Successfully formatted as simple numeric date
    const validation = validateDateFormat(simpleFormatted);
    if (validation.isValid) {
      console.log('✅ Successfully parsed simple numeric date:', simpleFormatted);
      return {
        success: true,
        date: simpleFormatted
      };
    }
  }
  
  // If simple format didn't work, proceed with complex spoken date parsing
  console.log('🔄 Attempting complex spoken date parsing...');
  
  // Croatian number mappings with comprehensive variations
  const numberMap: Record<string, number> = {
    // Basic numbers 0-31
    "nula": 0, "ništa": 0, "zero": 0,
    "jedan": 1, "jednu": 1, "jedna": 1, "jednog": 1, "prvog": 1, "prvi": 1,
    "dva": 2, "dvije": 2, "dvoje": 2, "dvaju": 2, "drugi": 2, "drugog": 2,
    "tri": 3, "troje": 3, "triju": 3, "treći": 3, "trećeg": 3, "treće": 3,
    "četiri": 4, "četri": 4, "četvero": 4, "četvrti": 4, "četvrtog": 4,
    "pet": 5, "petero": 5, "peti": 5, "petog": 5, "pete": 5,
    "šest": 6, "šes": 6, "šestero": 6, "šesti": 6, "šestog": 6,
    "sedam": 7, "sedmero": 7, "sedmi": 7, "sedmog": 7,
    "osam": 8, "osmero": 8, "osmi": 8, "osmog": 8,
    "devet": 9, "devetero": 9, "deveti": 9, "devetog": 9,
    "deset": 10, "desetero": 10, "deseti": 10, "desetog": 10,
    "jedanaest": 11, "jedanest": 11, "jedanaesti": 11,
    "dvanaest": 12, "dvanest": 12, "dvanaesti": 12,
    "trinaest": 13, "trinest": 13, "trinaesti": 13,
    "četrnaest": 14, "četrnest": 14, "četrnaesti": 14,
    "petnaest": 15, "petnest": 15, "petnaesti": 15,
    "šesnaest": 16, "šesnest": 16, "šesnaesti": 16,
    "sedamnaest": 17, "sedamnest": 17, "sedamnaesti": 17,
    "osamnaest": 18, "osamnest": 18, "osamnaesti": 18,
    "devetnaest": 19, "devetnest": 19, "devetnaesti": 19,
    "dvadeset": 20, "dvades": 20, "dvadeseti": 20,
    "dvadeset i jedan": 21, "dvadeset jedan": 21, "dvadeset prvog": 21,
    "dvadeset i dva": 22, "dvadeset dva": 22, "dvadeset drugog": 22,
    "dvadeset i tri": 23, "dvadeset tri": 23, "dvadeset trećeg": 23,
    "dvadeset i četiri": 24, "dvadeset četiri": 24, "dvadeset četvrtog": 24,
    "dvadeset i pet": 25, "dvadeset pet": 25, "dvadeset petog": 25,
    "dvadeset i šest": 26, "dvadeset šest": 26, "dvadeset šestog": 26,
    "dvadeset i sedam": 27, "dvadeset sedam": 27, "dvadeset sedmog": 27,
    "dvadeset i osam": 28, "dvadeset osam": 28, "dvadeset osmog": 28,
    "dvadeset i devet": 29, "dvadeset devet": 29, "dvadeset devetog": 29,
    "trideset": 30, "trides": 30, "trideseti": 30,
    "trideset i jedan": 31, "trideset jedan": 31, "trideset prvog": 31
  };

  // Month mappings with all variations
  const monthMap: Record<string, number> = {
    "siječanj": 1, "siječnja": 1, "prvog": 1, "prvi": 1, "prvom": 1,
    "veljača": 2, "veljače": 2, "drugog": 2, "drugi": 2, "drugom": 2,
    "ožujak": 3, "ožujka": 3, "trećeg": 3, "treći": 3, "trećem": 3,
    "travanj": 4, "travnja": 4, "četvrtog": 4, "četvrti": 4, "četvrtom": 4,
    "svibanj": 5, "svibnja": 5, "petog": 5, "peti": 5, "petom": 5,
    "lipanj": 6, "lipnja": 6, "šestog": 6, "šesti": 6, "šestom": 6,
    "srpanj": 7, "srpnja": 7, "sedmog": 7, "sedmi": 7, "sedmom": 7,
    "kolovoz": 8, "kolovoza": 8, "osmog": 8, "osmi": 8, "osmom": 8,
    "rujan": 9, "rujna": 9, "devetog": 9, "deveti": 9, "devetom": 9,
    "listopad": 10, "listopada": 10, "desetog": 10, "deseti": 10, "desetom": 10,
    "studeni": 11, "studenoga": 11, "jedanaestog": 11, "jedanaesti": 11, "jedanaestom": 11,
    "prosinac": 12, "prosinca": 12, "dvanaestog": 12, "dvanaesti": 12, "dvanaestom": 12
  };

  // Year patterns with enhanced recognition
  const yearPatterns: Record<string, number> = {
    "tisuću": 1000,
    "tisuća": 1000,
    "dvije tisuće": 2000,
    "dviju tisuća": 2000,
    "dvije tisuća": 2000,
    "dvje tisuće": 2000
  };

  let processed = transcript.toLowerCase().trim();
  
  // Remove common filler words and normalize
  processed = processed
    .replace(/\b(godine|god|datum|rođen|rođena|rođenja)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log('📝 Cleaned transcript:', processed);
  
  // Extract potential date components
  const extractedNumbers: number[] = [];
  
  // First, handle complex year patterns
  if (processed.includes('tisuću') || processed.includes('tisuća')) {
    const yearMatch = processed.match(/(tisuću|tisuća)\s+(.*?)(?:\s|$)/);
    if (yearMatch) {
      const yearPart = yearMatch[2];
      let year = 1000;
      
      // Parse hundreds
      if (yearPart.includes('devetsto')) {
        year += 900;
      } else if (yearPart.includes('osamsto')) {
        year += 800;
      } else if (yearPart.includes('sedamsto')) {
        year += 700;
      } else if (yearPart.includes('šesto')) {
        year += 600;
      }
      
      // Parse tens and units
      const remainingPart = yearPart.replace(/(devetsto|osamsto|sedamsto|šesto)/g, '').trim();
      const remainingWords = remainingPart.split(/\s+/);
      
      for (const word of remainingWords) {
        if (numberMap[word] !== undefined && numberMap[word] <= 99) {
          year += numberMap[word];
        }
      }
      
      if (year > 1000) {
        extractedNumbers.push(year);
        console.log('📅 Extracted year from "tisuću" pattern:', year);
      }
    }
  }
  
  // Handle "dvije tisuće" patterns
  if (processed.includes('dvije tisuće') || processed.includes('dviju tisuća') || processed.includes('dvije tisuća')) {
    const yearMatch = processed.match(/(dvije tisuće|dviju tisuća|dvije tisuća|dvje tisuće)\s+(.*?)(?:\s|$)/);
    if (yearMatch) {
      const yearPart = yearMatch[2];
      let year = 2000;
      
      const yearWords = yearPart.split(/\s+/);
      for (const word of yearWords) {
        if (numberMap[word] !== undefined && numberMap[word] <= 99) {
          year += numberMap[word];
        }
      }
      
      if (year > 2000) {
        extractedNumbers.push(year);
        console.log('📅 Extracted year from "dvije tisuće" pattern:', year);
      }
    }
  }
  
  // Handle compound numbers like "dvadeset tri"
  const compoundPatterns = [
    /dvadeset\s+i?\s*(jedan|dva|tri|četiri|pet|šest|sedam|osam|devet)/g,
    /trideset\s+i?\s*(jedan)/g
  ];
  
  compoundPatterns.forEach(pattern => {
    const matches = processed.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.replace(/\s+/g, ' ').trim();
        if (numberMap[cleanMatch]) {
          extractedNumbers.push(numberMap[cleanMatch]);
          console.log('🔢 Extracted compound number:', cleanMatch, '=', numberMap[cleanMatch]);
          processed = processed.replace(match, ''); // Remove processed part
        }
      });
    }
  });
  
  // Extract individual numbers and months
  const words = processed.split(/\s+/);
  
  for (const word of words) {
    const cleanWord = word.trim();
    
    // Check for numbers
    if (numberMap[cleanWord] !== undefined) {
      extractedNumbers.push(numberMap[cleanWord]);
      console.log('🔢 Extracted number:', cleanWord, '=', numberMap[cleanWord]);
    }
    
    // Check for months
    if (monthMap[cleanWord] !== undefined) {
      extractedNumbers.push(monthMap[cleanWord]);
      console.log('📅 Extracted month:', cleanWord, '=', monthMap[cleanWord]);
    }
    
    // Check for direct year numbers
    if (/^\d{4}$/.test(cleanWord)) {
      const yearNum = parseInt(cleanWord);
      if (yearNum >= 1900 && yearNum <= 2100) {
        extractedNumbers.push(yearNum);
        console.log('📅 Extracted direct year:', yearNum);
      }
    }
  }
  
  console.log('🔍 All extracted numbers:', extractedNumbers);
  
  // Try to identify day, month, year from extracted numbers
  if (extractedNumbers.length < 3) {
    return {
      success: false,
      error: 'Nedovoljno podataka za datum. Molimo navedite dan, mjesec i godinu.'
    };
  }
  
  let day: number | undefined;
  let month: number | undefined;
  let year: number | undefined;
  
  // Find year (typically the largest number > 1900)
  year = extractedNumbers.find(num => num > 1900 && num < 2100);
  
  // Find month (1-12, not the year)
  month = extractedNumbers.find(num => num >= 1 && num <= 12 && num !== year);
  
  // Find day (1-31, not year or month)
  day = extractedNumbers.find(num => num >= 1 && num <= 31 && num !== year && num !== month);
  
  console.log('🎯 Identified components:', { day, month, year });
  
  if (!day || !month || !year) {
    return {
      success: false,
      error: 'Nije moguće prepoznati dan, mjesec ili godinu iz izgovorenog teksta.'
    };
  }
  
  // Validate the date exists
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
    return {
      success: false,
      error: 'Neispravan datum. Molimo provjerite dan, mjesec i godinu.'
    };
  }
  
  // 🔧 CRITICAL: Use formatDateWithDots function for proper formatting
  const formattedDate = formatDateWithDots(day.toString(), month.toString(), year.toString());
  
  console.log('✅ Successfully parsed and formatted date:', formattedDate);
  
  return {
    success: true,
    date: formattedDate
  };
}

// Enhanced date validation with better error messages
export function validateDateFormat(dateString: string): { isValid: boolean; message?: string } {
  if (!dateString || !dateString.trim()) {
    return { isValid: false, message: 'Datum je obavezan' };
  }
  
  const trimmed = dateString.trim();
  
  // Check format DD.MM.GGGG (strict format with dots)
  const formatRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = trimmed.match(formatRegex);
  
  if (!match) {
    return { isValid: false, message: 'Neispravan format datuma. Koristite DD.MM.GGGG (npr. 15.03.1990)' };
  }
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Basic range checks
  if (day < 1 || day > 31) {
    return { isValid: false, message: 'Dan mora biti između 1 i 31' };
  }
  
  if (month < 1 || month > 12) {
    return { isValid: false, message: 'Mjesec mora biti između 1 i 12' };
  }
  
  if (year < 1900 || year > 2100) {
    return { isValid: false, message: 'Godina mora biti između 1900 i 2100' };
  }
  
  // Validate actual date existence
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
    return { isValid: false, message: 'Neispravan datum. Provjerite da li datum postoji (npr. ne postoji 32.01.2023).' };
  }
  
  return { isValid: true };
}

// Enhanced validation function for simple date format checking
export function isValidDateFormat(value: string): boolean {
  const formatRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!formatRegex.test(value)) return false;
  
  const [day, month, year] = value.split('.').map(Number);
  const dateObj = new Date(year, month - 1, day);
  
  return dateObj.getFullYear() === year && 
         dateObj.getMonth() === month - 1 && 
         dateObj.getDate() === day &&
         dateObj.toString() !== 'Invalid Date';
}