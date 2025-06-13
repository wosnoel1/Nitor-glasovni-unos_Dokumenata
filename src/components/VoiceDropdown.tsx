import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Check, X, Edit3, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ValidationRule } from '@/types/form';

interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface VoiceDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  validate?: ValidationRule;
  placeholder?: string;
  className?: string;
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

export function VoiceDropdown({ 
  label, 
  value, 
  onChange, 
  options,
  validate, 
  placeholder,
  className,
  onValidationComplete,
  autoFocus = false,
  disabled = false
}: VoiceDropdownProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.IDLE);
  const [fieldState, setFieldState] = useState<FieldState>(FieldState.EMPTY);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; message?: string } | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const selectRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus && selectRef.current && !disabled) {
      selectRef.current.focus();
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
    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('Speech Recognition is supported');
      setIsSupported(true);
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'hr-HR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 3;
      
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
            setSpeechError('Mikrofon nije dostupan. Provjerite dozvole za mikrofon.');
            break;
          case 'not-allowed':
            setSpeechError('Pristup mikrofonu je odbačen. Omogućite pristup u postavkama preglednika.');
            break;
          case 'network':
            setSpeechError('Mrežna greška. Provjerite internetsku vezu.');
            break;
          case 'service-not-allowed':
            setSpeechError('Usluga prepoznavanja govora nije dostupna.');
            break;
          case 'bad-grammar':
            setSpeechError('Greška u gramatici prepoznavanja.');
            break;
          case 'language-not-supported':
            setSpeechError('Hrvatski jezik nije podržan za prepoznavanje govora.');
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
  }, []);

  const processTranscript = (transcript: string) => {
    console.log('Processing dropdown transcript:', transcript);
    
    // Create voice mappings based on the field label - updated to match new values
    let voiceMap: Record<string, string> = {};
    
    if (label.includes('Status stanovanja')) {
      voiceMap = {
        "vlastiti": "Vlastiti stan/kuća",
        "vlastiti stan": "Vlastiti stan/kuća",
        "vlastiti kuća": "Vlastiti stan/kuća", 
        "vlastita kuća": "Vlastiti stan/kuća",
        "vlastita": "Vlastiti stan/kuća",
        "vlasništvo": "Vlastiti stan/kuća",
        "moj stan": "Vlastiti stan/kuća",
        "moja kuća": "Vlastiti stan/kuća",
        "kuća": "Vlastiti stan/kuća",
        
        "najam": "Najam",
        "najamnik": "Najam",
        "najamnica": "Najam",
        "iznajmljujem": "Najam",
        "rent": "Najam",
        "renta": "Najam",
        
        "kod roditelja": "Kod roditelja",
        "roditelji": "Kod roditelja",
        "s roditeljima": "Kod roditelja",
        "sa roditeljima": "Kod roditelja",
        "roditeljski dom": "Kod roditelja",
        "kod mama": "Kod roditelja",
        "kod tata": "Kod roditelja",
        "kod mame": "Kod roditelja",
        "kod tate": "Kod roditelja",
        
        "stanarsko pravo": "Stanarsko pravo",
        "stanarsko": "Stanarsko pravo",
        "stanarski": "Stanarsko pravo",
        "stanarska prava": "Stanarsko pravo",
        "društveni stan": "Stanarsko pravo",
        
        "ostalo": "Ostalo",
        "drugo": "Ostalo",
        "nešto drugo": "Ostalo",
        "ostale opcije": "Ostalo"
      };
    } else if (label.includes('Bračni status')) {
      voiceMap = {
        "neoženjen": "Neoženjen/neudana",
        "neudana": "Neoženjen/neudana",
        "samac": "Neoženjen/neudana",
        "samica": "Neoženjen/neudana",
        "slobodan": "Neoženjen/neudana",
        "slobodna": "Neoženjen/neudana",
        
        "oženjen": "Oženjen/udana",
        "udana": "Oženjen/udana",
        "u braku": "Oženjen/udana",
        "brak": "Oženjen/udana",
        
        "razveden": "Razveden/a",
        "razvedena": "Razveden/a",
        "razvod": "Razveden/a",
        
        "udovac": "Udovac/udovica",
        "udovica": "Udovac/udovica",
        
        "partner": "Izvanbračna zajednica",
        "partnerica": "Izvanbračna zajednica",
        "izvanbračna zajednica": "Izvanbračna zajednica",
        "izvanbračna": "Izvanbračna zajednica",
        "zajednica": "Izvanbračna zajednica"
      };
    } else if (label.includes('Vrsta ugovora')) {
      voiceMap = {
        "na neodređeno": "Na neodređeno",
        "neodređeno": "Na neodređeno",
        "neodredjeno": "Na neodređeno",
        "stalno": "Na neodređeno",
        "trajno": "Na neodređeno",
        
        "na određeno": "Na određeno",
        "određeno": "Na određeno",
        "odredjeno": "Na određeno",
        "privremeno": "Na određeno",
        "rok": "Na određeno",
        
        "ostalo": "Ostalo",
        "drugo": "Ostalo"
      };
    } else if (label.includes('Obrazovanje')) {
      voiceMap = {
        "nkv": "NKV / NSS",
        "nss": "NKV / NSS",
        "nekvalificiran": "NKV / NSS",
        "osnovna škola": "NKV / NSS",
        
        "kv": "KV",
        "kvalificiran": "KV",
        "kvalificirani": "KV",
        
        "vkv": "VKV",
        "viši": "VKV",
        "visokokvalificiran": "VKV",
        
        "sss": "SSS",
        "srednja škola": "SSS",
        "srednja": "SSS",
        "gimnazija": "SSS",
        
        "všs": "VŠS / PRISTUP",
        "viša škola": "VŠS / PRISTUP",
        "pristup": "VŠS / PRISTUP",
        
        "vss": "VSS / MAG / BACC",
        "fakultet": "VSS / MAG / BACC",
        "magistar": "VSS / MAG / BACC",
        "bacc": "VSS / MAG / BACC",
        "baccalaureus": "VSS / MAG / BACC",
        
        "mag univ": "MR / MAG UNIV / UNIV SPEC",
        "magistar univerzitetski": "MR / MAG UNIV / UNIV SPEC",
        "univ spec": "MR / MAG UNIV / UNIV SPEC",
        "specijalist": "MR / MAG UNIV / UNIV SPEC",
        "specijalizacija": "MR / MAG UNIV / UNIV SPEC",
        
        "dr": "DR / DR SC",
        "dr sc": "DR / DR SC",
        "doktor": "DR / DR SC",
        "doktorat": "DR / DR SC",
        "phd": "DR / DR SC"
      };
    } else if (label.includes('identifikacijske isprave')) {
      voiceMap = {
        "osobna iskaznica": "Osobna iskaznica",
        "osobna": "Osobna iskaznica",
        "iskaznica": "Osobna iskaznica",
        
        "putovnica": "Putovnica",
        "putni list": "Putovnica",
        "pasoš": "Putovnica",
        
        "vozačka dozvola": "Vozačka dozvola",
        "vozačka": "Vozačka dozvola",
        "dozvola": "Vozačka dozvola",
        "vozačku": "Vozačka dozvola",
        
        "ostalo": "Ostalo",
        "drugo": "Ostalo"
      };
    }

    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Try to find exact match first
    let matchedValue = voiceMap[lowerTranscript];
    
    // If no exact match, try partial matches
    if (!matchedValue) {
      for (const [key, value] of Object.entries(voiceMap)) {
        if (lowerTranscript.includes(key) || key.includes(lowerTranscript)) {
          matchedValue = value;
          break;
        }
      }
    }
    
    if (matchedValue) {
      console.log('Matched voice input to value:', matchedValue);
      onChange(matchedValue);
      
      setTimeout(() => {
        validateAndComplete(matchedValue);
      }, 100);
    } else {
      console.log('No match found for transcript:', transcript);
      const availableOptions = Object.keys(voiceMap).slice(0, 5).join(', ');
      setSpeechError(`Nije prepoznata opcija: "${transcript}". Pokušajte s: ${availableOptions}.`);
    }
  };

  const validateAndComplete = (inputValue: string) => {
    if (validate) {
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
    setIsOpen(true);
  };

  const handleValueChange = (newValue: string) => {
    if (disabled) return;
    
    if (newValue && !options.find(opt => opt.value === newValue)?.disabled) {
      onChange(newValue);
      setIsOpen(false);
      
      setTimeout(() => {
        validateAndComplete(newValue);
      }, 100);
    }
  };

  const getButtonVariant = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getButtonIcon = () => {
    switch (recordingState) {
      case RecordingState.RECORDING:
        return <MicOff className="h-4 w-4" />;
      default:
        return <Mic className="h-4 w-4" />;
    }
  };

  const showValidation = validationResult !== null;
  const isLocked = fieldState === FieldState.VALID && !editMode;
  const showEditButton = isLocked && !disabled;

  // Get display label for current value
  const getDisplayLabel = () => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : placeholder || "Odaberite...";
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
            <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={placeholder || "Odaberite..."} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleMicrophoneClick}
          disabled={disabled || recordingState === RecordingState.PROCESSING}
        >
          {getButtonIcon()}
        </Button>
        
        <div className="flex-1 relative">
          <Select 
            value={value} 
            onValueChange={handleValueChange}
            disabled={disabled || isLocked}
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <SelectTrigger 
              ref={selectRef}
              className={cn(
                "h-12 transition-all duration-200",
                showValidation && validationResult?.isValid && "border-green-500 bg-green-50",
                showValidation && !validationResult?.isValid && "border-red-500 bg-red-50",
                (isLocked || disabled) && "bg-gray-50 text-gray-700"
              )}
            >
              <SelectValue placeholder={placeholder || "Odaberite..."} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                  className={option.disabled ? "text-gray-400" : ""}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showValidation && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
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
          🔴 Snimanje u tijeku - recite jednu od dostupnih opcija
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