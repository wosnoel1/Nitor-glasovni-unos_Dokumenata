import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Check, X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { parseSpokenDateToNumeric, validateDateFormat, formatDateWithDots, isValidDateFormat } from '@/utils/dateParser';
import type { ValidationRule } from '@/types/form';

interface VoiceInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validate?: ValidationRule;
  placeholder?: string;
  className?: string;
  fieldType?: 'text' | 'oib' | 'number' | 'email' | 'phone' | 'date';
  onValidationComplete?: () => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

enum RecordingState {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing'
}

enum FieldState {
  EMPTY = 'empty',
  EDITING = 'editing',
  VALID = 'valid',
  INVALID = 'invalid'
}

export function VoiceInput({ 
  label, 
  value, 
  onChange, 
  validate, 
  placeholder,
  className,
  fieldType = 'text',
  onValidationComplete,
  autoFocus = false,
  disabled = false
}: VoiceInputProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [fieldState, setFieldState] = useState<FieldState>(FieldState.EMPTY);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message?: string } | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  useEffect(() => {
    // Update field state based on value and validation
    if (!value.trim()) {
      setFieldState(FieldState.EMPTY);
    } else if (editMode) {
      setFieldState(FieldState.EDITING);
    } else if (validationResult?.isValid) {
      setFieldState(FieldState.VALID);
    } else if (validationResult?.isValid === false) {
      setFieldState(FieldState.INVALID);
    }
  }, [value, editMode, validationResult]);

  useEffect(() => {
    // Don't initialize speech recognition if disabled
    if (disabled) return;

    // Initialize Speech Recognition with enhanced settings for mobile Bluetooth
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('Speech Recognition is supported');
      setIsSupported(true);
      
      recognitionRef.current = new SpeechRecognition();
      
      // Enhanced settings for mobile Bluetooth microphones
      recognitionRef.current.lang = 'hr-HR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 5; // Increased for better accuracy
      
      recognitionRef.current.onstart = () => {
        console.log('RECOGNITION STARTED');
        setRecordingState(RecordingState.RECORDING);
        setSpeechError(null);
      };
      
      recognitionRef.current.onresult = (event) => {
        console.log('RESULT:', event.results);
        
        if (event.results && event.results.length > 0) {
          let bestTranscript = event.results[0][0].transcript;
          let bestConfidence = event.results[0][0].confidence || 0;
          
          // Check all alternatives for better accuracy
          for (let i = 0; i < event.results[0].length; i++) {
            const alternative = event.results[0][i];
            if (alternative.confidence > bestConfidence) {
              bestTranscript = alternative.transcript;
              bestConfidence = alternative.confidence;
            }
          }
          
          console.log('Best transcript:', bestTranscript, 'Confidence:', bestConfidence);
          processTranscript(bestTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.log('Speech recognition error:', event.error);
        
        switch (event.error) {
          case 'no-speech':
            setSpeechError('Nije detektiran govor. Pokušajte ponovno i govorite jasnije.');
            break;
          case 'audio-capture':
            setSpeechError('Mikrofon nije dostupan. Provjerite Bluetooth vezu i dozvole.');
            break;
          case 'not-allowed':
            setSpeechError('Pristup mikrofonu je odbačen. Omogućite pristup u postavkama.');
            break;
          case 'network':
            setSpeechError('Mrežna greška. Provjerite internetsku vezu.');
            break;
          case 'service-not-allowed':
            setSpeechError('Usluga prepoznavanja govora nije dostupna.');
            break;
          case 'aborted':
            console.log('Speech recognition aborted (normal termination)');
            break;
          default:
            setSpeechError('Greška u prepoznavanju govora. Pokušajte ponovno.');
            break;
        }
        
        setRecordingState(RecordingState.IDLE);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Recognition ended');
        setRecordingState(RecordingState.IDLE);
      };
    } else {
      console.log('Speech Recognition is not supported');
      setIsSupported(false);
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [fieldType, disabled]);

  const processTranscript = (transcript: string) => {
    switch (fieldType) {
      case 'email':
        processEmailTranscript(transcript);
        break;
      case 'oib':
        processOIBTranscript(transcript);
        break;
      case 'number':
        processNumberTranscript(transcript);
        break;
      case 'phone':
        processPhoneTranscript(transcript);
        break;
      case 'date':
        processDateTranscript(transcript);
        break;
      default:
        processTextTranscript(transcript);
        break;
    }
  };

  const processDateTranscript = (transcript: string) => {
    console.log('🗓️ Processing date transcript:', transcript);
    
    // Show original transcript first for user feedback
    onChange(transcript);
    
    // Add visual feedback that we're processing
    setRecordingState(RecordingState.PROCESSING);
    
    setTimeout(() => {
      // First, try simple numeric format conversion
      const simpleFormatted = formatDateWithDots(transcript);
      
      if (simpleFormatted !== transcript && isValidDateFormat(simpleFormatted)) {
        console.log('✅ Successfully formatted simple numeric date:', simpleFormatted);
        onChange(simpleFormatted);
        
        setTimeout(() => {
          const validation = validateDateFormat(simpleFormatted);
          setValidationResult(validation);
          
          if (validation.isValid) {
            setEditMode(false);
            console.log('✅ Simple date validation successful, moving to next field');
            if (onValidationComplete) {
              setTimeout(() => {
                onValidationComplete();
              }, 500);
            }
          }
          
          setRecordingState(RecordingState.IDLE);
        }, 200);
        
        return;
      }
      
      // If simple format didn't work, try complex spoken date parsing
      const parseResult = parseSpokenDateToNumeric(transcript);
      
      if (parseResult.success && parseResult.date) {
        console.log('✅ Successfully parsed complex spoken date:', parseResult.date);
        onChange(parseResult.date);
        
        // Validate the parsed date after a short delay
        setTimeout(() => {
          const validation = validateDateFormat(parseResult.date!);
          setValidationResult(validation);
          
          if (validation.isValid) {
            setEditMode(false);
            console.log('✅ Complex date validation successful, moving to next field');
            if (onValidationComplete) {
              setTimeout(() => {
                onValidationComplete();
              }, 500);
            }
          } else {
            console.log('❌ Date validation failed:', validation.message);
            setSpeechError(validation.message || 'Neispravan datum');
          }
          
          setRecordingState(RecordingState.IDLE);
        }, 200);
      } else {
        console.log('❌ Date parsing failed:', parseResult.error);
        setSpeechError(parseResult.error || 'Nije moguće prepoznati datum');
        setValidationResult({ 
          isValid: false, 
          message: parseResult.error || 'Neispravan datum' 
        });
        setRecordingState(RecordingState.IDLE);
      }
    }, 1000); // Show original transcript for 1 second before processing
  };

  const processPhoneTranscript = (transcript: string) => {
    onChange(transcript);
    console.log('Showing original phone transcript:', transcript);
    
    setTimeout(() => {
      const phoneMap: Record<string, string> = {
        "nula": "0", "ništa": "0",
        "jedan": "1", "jednu": "1", "jedna": "1",
        "dva": "2", "dvije": "2",
        "tri": "3",
        "četiri": "4", "četri": "4",
        "pet": "5",
        "šest": "6", "šes": "6",
        "sedam": "7",
        "osam": "8",
        "devet": "9",
        "plus": "+",
        "hrvatska": "+385",
        "tri osam pet": "+385"
      };

      let processed = transcript.toLowerCase();
      
      Object.entries(phoneMap).forEach(([word, digit]) => {
        processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
      });
      
      const sanitized = processed.replace(/[^\d+]/g, '');
      
      console.log('Transformed phone:', sanitized);
      onChange(sanitized);
      
      setTimeout(() => {
        validateAndComplete(sanitized);
      }, 100);
    }, 500);
  };

  const processEmailTranscript = (transcript: string) => {
    onChange(transcript);
    console.log('Showing original email transcript:', transcript);
    
    setTimeout(() => {
      const emailWordMap: Record<string, string> = {
        "et": "@", "ad": "@", "majmun": "@", "manki": "@", "monkey": "@",
        "at": "@", "eta": "@", "add": "@", "ed": "@",
        "točka": ".", "tačka": ".", "dot": ".", "tacka": ".", "tocka": ".",
        "točku": ".", "tačku": ".", "točke": ".", "tačke": ".",
        "minus": "-", "crtica": "-", "dash": "-", "tire": "-",
        "podvlaka": "_", "underscore": "_", "donja crtica": "_",
        "gmail": "gmail", "džimejl": "gmail", "jimejl": "gmail", "gmejl": "gmail",
        "google mail": "gmail", "gugl mejl": "gmail",
        "yahoo": "yahoo", "jahu": "yahoo", "jahoo": "yahoo",
        "outlook": "outlook", "autluk": "outlook", "outluk": "outlook",
        "hotmail": "hotmail", "hotmejl": "hotmail",
        "kom": "com", "c o m": "com", "see o m": "com", "si o em": "com",
        "hr": "hr", "h r": "hr", "ha er": "hr",
        "net": "net", "org": "org",
        "info": "info", "admin": "admin", "support": "support",
        "contact": "contact", "kontakt": "contact",
        "nula": "0", "jedan": "1", "dva": "2", "tri": "3", "četiri": "4",
        "pet": "5", "šest": "6", "sedam": "7", "osam": "8", "devet": "9"
      };

      let processed = transcript.toLowerCase().trim();
      const words = processed.split(/\s+/);
      const transformedWords = words.map(word => {
        const cleanWord = word.replace(/[.,!?;]/g, '');
        return emailWordMap[cleanWord] || word;
      });
      
      let sanitized = transformedWords.join('');
      sanitized = sanitized
        .replace(/\s+/g, '')
        .replace(/\.+/g, '.')
        .replace(/@+/g, '@')
        .replace(/--+/g, '-')
        .replace(/__+/g, '_');
      
      if (sanitized.includes('@gmail') && !sanitized.includes('.com')) {
        sanitized = sanitized.replace('@gmail', '@gmail.com');
      }
      if (sanitized.includes('@yahoo') && !sanitized.includes('.com')) {
        sanitized = sanitized.replace('@yahoo', '@yahoo.com');
      }
      if (sanitized.includes('@outlook') && !sanitized.includes('.com')) {
        sanitized = sanitized.replace('@outlook', '@outlook.com');
      }
      if (sanitized.includes('@hotmail') && !sanitized.includes('.com')) {
        sanitized = sanitized.replace('@hotmail', '@hotmail.com');
      }
      
      sanitized = sanitized
        .replace(/gmail\.kom/g, 'gmail.com')
        .replace(/yahoo\.kom/g, 'yahoo.com')
        .replace(/outlook\.kom/g, 'outlook.com')
        .replace(/hotmail\.kom/g, 'hotmail.com');
      
      console.log('Email transformation:', { original: transcript, final: sanitized });
      onChange(sanitized);
      
      setTimeout(() => {
        validateAndComplete(sanitized);
      }, 100);
    }, 800);
  };

  const processOIBTranscript = (transcript: string) => {
    onChange(transcript);
    console.log('Showing original OIB transcript:', transcript);
    
    setTimeout(() => {
      const numberWordMap: Record<string, string> = {
        "nula": "0", "ništa": "0", "zero": "0",
        "jedan": "1", "jednu": "1", "jedna": "1", "jednog": "1",
        "dva": "2", "dvije": "2", "dvoje": "2", "dvaju": "2",
        "tri": "3", "troje": "3", "triju": "3",
        "četiri": "4", "četri": "4", "četvero": "4", "četiriju": "4",
        "pet": "5", "petero": "5", "petiju": "5",
        "šest": "6", "šes": "6", "šestero": "6", "šestiju": "6",
        "sedam": "7", "sedmero": "7", "sedmiju": "7",
        "osam": "8", "osmero": "8", "osmiju": "8",
        "devet": "9", "devetero": "9", "devetiju": "9",
        "deset": "10", "desetero": "10",
        "jedanaest": "11", "jedanest": "11",
        "dvanaest": "12", "dvanest": "12",
        "trinaest": "13", "trinest": "13",
        "četrnaest": "14", "četrnest": "14",
        "petnaest": "15", "petnest": "15",
        "šesnaest": "16", "šesnest": "16",
        "sedamnaest": "17", "sedamnest": "17",
        "osamnaest": "18", "osamnest": "18",
        "devetnaest": "19", "devetnest": "19",
        "dvadeset": "20", "dvades": "20",
        "trideset": "30", "tridesetak": "30",
        "četrdeset": "40", "četrdesetak": "40",
        "pedeset": "50", "pedesetak": "50",
        "šezdeset": "60", "šezdesetak": "60",
        "sedamdeset": "70", "sedamdesetak": "70",
        "osamdeset": "80", "osamdesetak": "80",
        "devedeset": "90", "devedesetak": "90"
      };

      let processed = transcript.toLowerCase().trim();
      
      Object.entries(numberWordMap).forEach(([word, digit]) => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        processed = processed.replace(regex, ` ${digit} `);
      });
      
      processed = processed
        .replace(/dvadeset\s+jedan/g, '21')
        .replace(/dvadeset\s+dva/g, '22')
        .replace(/dvadeset\s+tri/g, '23')
        .replace(/dvadeset\s+četiri/g, '24')
        .replace(/dvadeset\s+pet/g, '25')
        .replace(/dvadeset\s+šest/g, '26')
        .replace(/dvadeset\s+sedam/g, '27')
        .replace(/dvadeset\s+osam/g, '28')
        .replace(/dvadeset\s+devet/g, '29')
        .replace(/trideset\s+jedan/g, '31')
        .replace(/trideset\s+dva/g, '32')
        .replace(/trideset\s+tri/g, '33')
        .replace(/trideset\s+četiri/g, '34')
        .replace(/trideset\s+pet/g, '35')
        .replace(/trideset\s+šest/g, '36')
        .replace(/trideset\s+sedam/g, '37')
        .replace(/trideset\s+osam/g, '38')
        .replace(/trideset\s+devet/g, '39');
      
      const sanitized = processed.replace(/[^\d]/g, '');
      
      console.log('OIB transformation:', { original: transcript, final: sanitized });
      onChange(sanitized);
      
      setTimeout(() => {
        validateAndComplete(sanitized);
      }, 100);
    }, 800);
  };

  const processNumberTranscript = (transcript: string) => {
    onChange(transcript);
    console.log('Showing original number transcript:', transcript);
    
    setTimeout(() => {
      // Enhanced number mapping for Croatian with large numbers
      const numberMap: Record<string, string> = {
        "nula": "0", "ništa": "0",
        "jedan": "1", "jednu": "1", "jedna": "1",
        "dva": "2", "dvije": "2",
        "tri": "3",
        "četiri": "4", "četri": "4",
        "pet": "5",
        "šest": "6", "šes": "6",
        "sedam": "7",
        "osam": "8",
        "devet": "9",
        "deset": "10",
        "jedanaest": "11",
        "dvanaest": "12",
        "trinaest": "13",
        "četrnaest": "14",
        "petnaest": "15",
        "šesnaest": "16",
        "sedamnaest": "17",
        "osamnaest": "18",
        "devetnaest": "19",
        "dvadeset": "20",
        "trideset": "30",
        "četrdeset": "40",
        "pedeset": "50",
        "šezdeset": "60",
        "sedamdeset": "70",
        "osamdeset": "80",
        "devedeset": "90",
        "sto": "100",
        "stotinu": "100",
        "dvjesto": "200",
        "dvjesta": "200",
        "tristo": "300",
        "trista": "300",
        "četiristo": "400",
        "četirista": "400",
        "petsto": "500",
        "petsto": "500",
        "šesto": "600",
        "šesta": "600",
        "sedamsto": "700",
        "sedamsta": "700",
        "osamsto": "800",
        "osamsta": "800",
        "devetsto": "900",
        "devetsta": "900",
        "tisuću": "1000",
        "tisuća": "1000",
        "hiljada": "1000",
        "hiljade": "1000",
        "zarez": ".", "točka": ".", "i": "."
      };

      let processed = transcript.toLowerCase();
      
      // Handle compound numbers like "dvadeset pet tisuća"
      if (processed.includes('tisuć') || processed.includes('hiljad')) {
        // Extract the number before "tisuća/hiljada"
        const thousandMatch = processed.match(/(.*?)\s*(tisuć|hiljad)/);
        if (thousandMatch) {
          const beforeThousand = thousandMatch[1].trim();
          let multiplier = 1;
          
          // Convert the part before thousand to number
          let tempProcessed = beforeThousand;
          Object.entries(numberMap).forEach(([word, digit]) => {
            tempProcessed = tempProcessed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
          });
          
          // Handle compound numbers like "dvadeset pet" = 25
          tempProcessed = tempProcessed
            .replace(/dvadeset\s+pet/g, '25')
            .replace(/dvadeset\s+jedan/g, '21')
            .replace(/dvadeset\s+dva/g, '22')
            .replace(/dvadeset\s+tri/g, '23')
            .replace(/dvadeset\s+četiri/g, '24')
            .replace(/dvadeset\s+šest/g, '26')
            .replace(/dvadeset\s+sedam/g, '27')
            .replace(/dvadeset\s+osam/g, '28')
            .replace(/dvadeset\s+devet/g, '29')
            .replace(/trideset\s+pet/g, '35')
            .replace(/pedeset\s+pet/g, '55');
          
          const numbers = tempProcessed.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            multiplier = parseInt(numbers[0]);
          }
          
          const result = (multiplier * 1000).toString();
          console.log('Parsed large number:', { original: transcript, multiplier, result });
          onChange(result);
          
          setTimeout(() => {
            validateAndComplete(result);
          }, 100);
          return;
        }
      }
      
      // Regular number processing
      Object.entries(numberMap).forEach(([word, digit]) => {
        processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
      });
      
      // Handle compound numbers
      processed = processed
        .replace(/dvadeset\s+pet/g, '25')
        .replace(/dvadeset\s+jedan/g, '21')
        .replace(/dvadeset\s+dva/g, '22')
        .replace(/dvadeset\s+tri/g, '23')
        .replace(/dvadeset\s+četiri/g, '24')
        .replace(/dvadeset\s+šest/g, '26')
        .replace(/dvadeset\s+sedam/g, '27')
        .replace(/dvadeset\s+osam/g, '28')
        .replace(/dvadeset\s+devet/g, '29');
      
      const sanitized = processed.replace(/[^\d.,]/g, '').replace(',', '.');
      
      console.log('Transformed number:', sanitized);
      onChange(sanitized);
      
      setTimeout(() => {
        validateAndComplete(sanitized);
      }, 100);
    }, 500);
  };

  const processTextTranscript = (transcript: string) => {
    console.log('Processing text transcript:', transcript);
    
    // Enhanced country name mapping for "Država prebivališta" field
    if (label.toLowerCase().includes('država')) {
      const countryMap: Record<string, string> = {
        // European countries
        "hrvatska": "Hrvatska",
        "hrv": "Hrvatska",
        "croatia": "Hrvatska",
        "slovenija": "Slovenija",
        "slovenia": "Slovenija",
        "srbija": "Srbija",
        "serbia": "Srbija",
        "bosna": "Bosna i Hercegovina",
        "bosna i hercegovina": "Bosna i Hercegovina",
        "bosnia": "Bosna i Hercegovina",
        "crna gora": "Crna Gora",
        "montenegro": "Crna Gora",
        "makedonija": "Sjeverna Makedonija",
        "macedonia": "Sjeverna Makedonija",
        "albanija": "Albanija",
        "albania": "Albanija",
        "italija": "Italija",
        "italy": "Italija",
        "austrija": "Austrija",
        "austria": "Austrija",
        "njemačka": "Njemačka",
        "germany": "Njemačka",
        "francuska": "Francuska",
        "france": "Francuska",
        "španjolska": "Španjolska",
        "spain": "Španjolska",
        "portugal": "Portugal",
        "švicarska": "Švicarska",
        "switzerland": "Švicarska",
        "belgija": "Belgija",
        "belgium": "Belgija",
        "nizozemska": "Nizozemska",
        "netherlands": "Nizozemska",
        "danska": "Danska",
        "denmark": "Danska",
        "švedska": "Švedska",
        "sweden": "Švedska",
        "norveška": "Norveška",
        "norway": "Norveška",
        "finska": "Finska",
        "finland": "Finska",
        "poljska": "Poljska",
        "poland": "Poljska",
        "češka": "Češka",
        "czech": "Češka",
        "slovačka": "Slovačka",
        "slovakia": "Slovačka",
        "mađarska": "Mađarska",
        "hungary": "Mađarska",
        "rumunjska": "Rumunjska",
        "romania": "Rumunjska",
        "bugarska": "Bugarska",
        "bulgaria": "Bugarska",
        "grčka": "Grčka",
        "greece": "Grčka",
        "turska": "Turska",
        "turkey": "Turska",
        "rusija": "Rusija",
        "russia": "Rusija",
        "ukrajina": "Ukrajina",
        "ukraine": "Ukrajina",
        "velika britanija": "Velika Britanija",
        "united kingdom": "Velika Britanija",
        "uk": "Velika Britanija",
        "irska": "Irska",
        "ireland": "Irska",
        
        // Other major countries
        "amerika": "Sjedinjene Američke Države",
        "usa": "Sjedinjene Američke Države",
        "united states": "Sjedinjene Američke Države",
        "kanada": "Kanada",
        "canada": "Kanada",
        "australija": "Australija",
        "australia": "Australija",
        "novi zeland": "Novi Zeland",
        "new zealand": "Novi Zeland",
        "japan": "Japan",
        "kina": "Kina",
        "china": "Kina",
        "indija": "Indija",
        "india": "Indija",
        "brazil": "Brazil",
        "argentina": "Argentina",
        "čile": "Čile",
        "chile": "Čile",
        "meksiko": "Meksiko",
        "mexico": "Meksiko"
      };

      let processed = transcript.toLowerCase().trim();
      
      // Try to find exact match first
      let matchedCountry = countryMap[processed];
      
      // If no exact match, try partial matches
      if (!matchedCountry) {
        for (const [key, value] of Object.entries(countryMap)) {
          if (processed.includes(key) || key.includes(processed)) {
            matchedCountry = value;
            break;
          }
        }
      }
      
      if (matchedCountry) {
        console.log('Matched country:', matchedCountry);
        onChange(matchedCountry);
      } else {
        // Capitalize first letter for unknown countries
        const capitalized = transcript.charAt(0).toUpperCase() + transcript.slice(1).toLowerCase();
        onChange(capitalized);
      }
    } else {
      // Regular name processing for other text fields
      const nameMap: Record<string, string> = {
        "justice": "Justinović",
        "justin": "Justin",
        "justinovic": "Justinović",
        "marko": "Marko",
        "ana": "Ana",
        "petra": "Petra",
        "ivan": "Ivan",
        "maja": "Maja",
        "luka": "Luka",
        "sara": "Sara",
        "david": "David",
        "elena": "Elena",
        "nikola": "Nikola",
        "katarina": "Katarina",
        "antonio": "Antonio",
        "barbara": "Barbara",
        "filip": "Filip",
        "andrea": "Andrea",
        "mateo": "Mateo",
        "lucija": "Lucija",
        "mario": "Mario",
        "tomislav": "Tomislav",
        "josip": "Josip",
        "stjepan": "Stjepan",
        "ante": "Ante",
        "ivo": "Ivo",
        "hrvoje": "Hrvoje",
        "damir": "Damir",
        "zoran": "Zoran",
        "goran": "Goran"
      };

      let processed = transcript;
      
      Object.entries(nameMap).forEach(([incorrect, correct]) => {
        const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
        processed = processed.replace(regex, correct);
      });
      
      if (fieldType === 'text' && (label.toLowerCase().includes('ime') || label.toLowerCase().includes('prezime'))) {
        processed = processed.replace(/\b\w+/g, word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
      }
      
      onChange(processed);
    }
    
    setTimeout(() => {
      validateAndComplete(value || transcript);
    }, 100);
  };

  const validateAndComplete = (inputValue: string) => {
    if (fieldType === 'date') {
      const validation = validateDateFormat(inputValue);
      setValidationResult(validation);
      
      if (validation.isValid) {
        setEditMode(false);
        if (onValidationComplete) {
          setTimeout(() => {
            onValidationComplete();
          }, 500);
        }
      }
    } else if (validate) {
      const result = validate(inputValue);
      setValidationResult(result);
      
      if (result.isValid) {
        setEditMode(false);
        if (onValidationComplete) {
          setTimeout(() => {
            onValidationComplete();
          }, 500);
        }
      }
    } else {
      setValidationResult({ isValid: true });
      setEditMode(false);
      if (onValidationComplete) {
        setTimeout(() => {
          onValidationComplete();
        }, 500);
      }
    }
  };

  const handleMicrophoneClick = () => {
    if (disabled || !recognitionRef.current || !isSupported) {
      console.log('Recognition not available or disabled');
      return;
    }
    
    if (recordingState === RecordingState.IDLE) {
      console.log('Starting recording...');
      setValidationResult(null);
      setSpeechError(null);
      setEditMode(true);
      
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        setRecordingState(RecordingState.IDLE);
        setSpeechError('Greška pri pokretanju prepoznavanja govora.');
      }
    } else if (recordingState === RecordingState.RECORDING) {
      console.log('Stopping recording...');
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  };

  const handleEditClick = () => {
    if (disabled) return;
    
    setEditMode(true);
    setValidationResult(null);
    setSpeechError(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = e.target.value;
    onChange(newValue);
    
    if (validationResult) {
      setValidationResult(null);
    }
    
    if (speechError) {
      setSpeechError(null);
    }
  };

  const handleInputBlur = () => {
    if (disabled) return;
    
    if (value.trim() && editMode) {
      validateAndComplete(value);
    } else if (!value.trim()) {
      setEditMode(false);
      setValidationResult(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (value.trim() && editMode) {
        validateAndComplete(value);
      }
    }
  };

  const getButtonVariant = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return 'destructive';
      case RecordingState.PROCESSING:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getButtonIcon = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return <MicOff className="h-4 w-4" />;
      case RecordingState.PROCESSING:
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  const showValidation = validationResult !== null;
  const isLocked = fieldState === FieldState.VALID && !editMode;
  const showEditButton = isLocked && !disabled;

  // Enhanced placeholder for different field types
  const getPlaceholder = () => {
    if (fieldType === 'date') {
      return placeholder || 'Unesite datum (DD.MM.GGGG) ili koristite glas';
    } else if (fieldType === 'number' && label.toLowerCase().includes('kredit')) {
      return placeholder || 'Unesite iznos (npr. "dvadeset pet tisuća" = 25000)';
    }
    return placeholder || label;
  };

  // Get input type based on field type
  const getInputType = () => {
    switch (fieldType) {
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      case 'date':
        return 'text'; // Use text for better control over format
      case 'number':
        return 'number';
      default:
        return 'text';
    }
  };

  if (!isSupported) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="h-12 w-12 shrink-0"
            disabled
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Input
              ref={inputRef}
              type={getInputType()}
              value={value}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="text-sm"
              disabled={disabled}
            />
          </div>
        </div>
        <p className="text-sm text-red-600 ml-15">Glasovni unos nije podržan u ovom pregledniku</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-3">
        <Button
          variant={getButtonVariant()}
          size="icon"
          className={cn(
            "h-12 w-12 shrink-0 transition-all duration-200",
            recordingState === RecordingState.RECORDING && "scale-110 shadow-lg bg-red-600 hover:bg-red-700",
            recordingState === RecordingState.PROCESSING && "bg-blue-500 hover:bg-blue-600",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleMicrophoneClick}
          disabled={disabled || recordingState === RecordingState.PROCESSING}
        >
          {getButtonIcon()}
        </Button>
        
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type={getInputType()}
            value={value}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            disabled={disabled || isLocked}
            className={cn(
              "text-sm transition-all duration-200",
              showValidation && validationResult?.isValid && "border-green-500 bg-green-50",
              showValidation && !validationResult?.isValid && "border-red-500 bg-red-50",
              (isLocked || disabled) && "bg-gray-50 text-gray-700"
            )}
            data-field-key={label}
          />
          
          {showValidation && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {validationResult?.isValid ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <X className="h-4 w-4 text-red-600" />
              )}
            </div>
          )}
        </div>

        {showEditButton && (
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0"
            onClick={handleEditClick}
            title="Uredi polje"
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {recordingState === RecordingState.RECORDING && !disabled && (
        <p className="text-sm text-red-600 ml-15 animate-pulse">
          🔴 Snimanje u tijeku - {
            fieldType === 'date' 
              ? 'recite datum (npr. "petnaesti ožujka dvije tisuće dvadeset treće" ili "15 12 1973")' 
              : fieldType === 'number' && label.toLowerCase().includes('kredit')
                ? 'recite iznos (npr. "dvadeset pet tisuća")'
                : 'kliknite mikrofon ponovno za završetak'
          }
        </p>
      )}
      
      {recordingState === RecordingState.PROCESSING && !disabled && (
        <p className="text-sm text-blue-600 ml-15 animate-pulse">
          🔄 {fieldType === 'date' ? 'Obrađujem datum...' : 'Obrađujem unos...'}
        </p>
      )}
      
      {speechError && !disabled && (
        <p className="text-sm text-orange-600 ml-15">{speechError}</p>
      )}
      
      {showValidation && !validationResult?.isValid && validationResult?.message && !disabled && (
        <p className="text-sm text-red-600 ml-15">{validationResult.message}</p>
      )}
    </div>
  );
}