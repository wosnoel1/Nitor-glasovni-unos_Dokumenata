import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FormSection } from '@/components/FormSection';
import { Download, Edit3, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  nameValidation, 
  oibValidation, 
  emailValidation, 
  phoneValidation,
  workExperienceValidation,
  numberValidation,
  basicTextValidation,
  optionalTextValidation,
  dropdownValidation,
  dateValidation
} from '@/utils/validation';
import type { FormData, DropdownOption } from '@/types/form';

function App() {
  // Agent login state
  const [agentCode, setAgentCode] = useState("");
  const [isAgentLoggedIn, setIsAgentLoggedIn] = useState(false);
  const [agentCodeError, setAgentCodeError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    // Osnovni podaci
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    countryOfBirth: '',
    citizenship1: '',
    citizenship2: '',
    citizenship3: '',
    
    // Kontakt podaci
    email: '',
    mobileNumber: '',
    
    // Adrese
    adresaPrebivalista: '', // NEW FIELD - replaced residenceAddress
    residencePlace: '',
    countryOfResidence: '', // NEW FIELD
    stayOutsideRH: '',
    place: '',
    
    // Obitelj i kućanstvo
    householdMembers: '',
    dependentChildren: '',
    otherDependents: '',
    
    // Status i osobni podaci
    statusStanovanja: '',
    bracniStatus: '',
    obrazovanje: '',
    
    // Dokumenti
    identificationDocumentType: '',
    identificationDocumentNumber: '',
    identificationDocumentIssuer: '',
    identificationDocumentName: '',
    oib: '',
    
    // Zaposlenje
    employerName: '',
    employerOIB: '',
    vrstaUgovora: '',
    datumOd: '',
    datumDo: '',
    workExperience: '',
    totalWorkExperience: '',
    employmentStatus: '',
    
    // Banke i ponude
    acceptedBankOffer: '',
    rejectedBankRequest: '',
    bankName: '',
    odobreniIznosKredita: '', // NEW FIELD - replaced cashCredit
    
    // Legacy fields (keeping for compatibility)
    residence: '',
    residenceStatus: '',
    identificationDocument: '',
    employmentContract: '',
    cashCredit: '', // Keep for backward compatibility but not used in form
    residenceAddress: '' // Keep for backward compatibility
  });

  // Agent code validation - format: 001, 002, 003, ... 100
  const validateAgentCode = (code: string) => {
    // Check if it's a number between 1 and 100
    const num = parseInt(code, 10);
    return !isNaN(num) && num >= 1 && num <= 100 && code.length >= 1 && code.length <= 3;
  };

  const formatAgentCode = (code: string) => {
    const num = parseInt(code, 10);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      return num.toString().padStart(3, '0');
    }
    return code;
  };

  const handleAgentLogin = () => {
    const formattedCode = formatAgentCode(agentCode);
    if (validateAgentCode(agentCode)) {
      setAgentCode(formattedCode);
      setIsAgentLoggedIn(true);
      setAgentCodeError("");
    } else {
      setAgentCodeError("Neispravna šifra agenta. Unesite broj između 1 i 100 (npr. 7, 25, 100)");
    }
  };

  const handleAgentEdit = () => {
    setIsAgentLoggedIn(false);
    setAgentCodeError("");
  };

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Dropdown options with human-readable values
  const statusStanovanjaOptions: DropdownOption[] = [
    { label: "Odaberite status stanovanja", value: "default-placeholder", disabled: true },
    { label: "Vlastiti stan/kuća", value: "Vlastiti stan/kuća" },
    { label: "Najam", value: "Najam" },
    { label: "Kod roditelja", value: "Kod roditelja" },
    { label: "Stanarsko pravo", value: "Stanarsko pravo" },
    { label: "Ostalo", value: "Ostalo" }
  ];

  const bracniStatusOptions: DropdownOption[] = [
    { label: "Odaberite bračni status", value: "default-placeholder", disabled: true },
    { label: "Neoženjen/neudana", value: "Neoženjen/neudana" },
    { label: "Oženjen/udana", value: "Oženjen/udana" },
    { label: "Razveden/a", value: "Razveden/a" },
    { label: "Udovac/udovica", value: "Udovac/udovica" },
    { label: "Izvanbračna zajednica", value: "Izvanbračna zajednica" }
  ];

  const vrstaUgovoraOptions: DropdownOption[] = [
    { label: "Odaberite vrstu ugovora", value: "default-placeholder", disabled: true },
    { label: "Na neodređeno", value: "Na neodređeno" },
    { label: "Na određeno", value: "Na određeno" },
    { label: "Ostalo", value: "Ostalo" }
  ];

  const obrazovanjeOptions: DropdownOption[] = [
    { label: "Odaberite obrazovanje", value: "default-placeholder", disabled: true },
    { label: "NKV / NSS", value: "NKV / NSS" },
    { label: "KV", value: "KV" },
    { label: "VKV", value: "VKV" },
    { label: "SSS", value: "SSS" },
    { label: "VŠS / PRISTUP", value: "VŠS / PRISTUP" },
    { label: "VSS / MAG / BACC", value: "VSS / MAG / BACC" },
    { label: "MR / MAG UNIV / UNIV SPEC", value: "MR / MAG UNIV / UNIV SPEC" },
    { label: "DR / DR SC", value: "DR / DR SC" }
  ];

  const identificationTypeOptions: DropdownOption[] = [
    { label: "Odaberite vrstu isprave", value: "default-placeholder", disabled: true },
    { label: "Osobna iskaznica", value: "Osobna iskaznica" },
    { label: "Putovnica", value: "Putovnica" },
    { label: "Vozačka dozvola", value: "Vozačka dozvola" },
    { label: "Ostalo", value: "Ostalo" }
  ];

  // Check if all required fields are valid
  const isFormValid = () => {
    const validations = [
      // Osnovni podaci
      nameValidation(formData.firstName),
      nameValidation(formData.lastName),
      dateValidation(formData.dateOfBirth),
      basicTextValidation(formData.placeOfBirth),
      basicTextValidation(formData.countryOfBirth),
      basicTextValidation(formData.citizenship1),
      
      // Kontakt podaci
      emailValidation(formData.email),
      phoneValidation(formData.mobileNumber),
      
      // Adrese
      basicTextValidation(formData.adresaPrebivalista), // NEW VALIDATION - replaced residenceAddress
      basicTextValidation(formData.residencePlace),
      basicTextValidation(formData.countryOfResidence), // NEW VALIDATION
      
      // Obitelj i kućanstvo
      numberValidation(formData.householdMembers),
      numberValidation(formData.dependentChildren),
      numberValidation(formData.otherDependents),
      
      // Status i osobni podaci
      dropdownValidation(formData.statusStanovanja),
      dropdownValidation(formData.bracniStatus),
      dropdownValidation(formData.obrazovanje),
      
      // Dokumenti
      dropdownValidation(formData.identificationDocumentType),
      basicTextValidation(formData.identificationDocumentNumber),
      basicTextValidation(formData.identificationDocumentIssuer),
      oibValidation(formData.oib),
      
      // Zaposlenje
      basicTextValidation(formData.employerName),
      oibValidation(formData.employerOIB),
      dropdownValidation(formData.vrstaUgovora),
      workExperienceValidation(formData.workExperience),
      workExperienceValidation(formData.totalWorkExperience),
      
      // Banke
      basicTextValidation(formData.bankName),
      numberValidation(formData.odobreniIznosKredita) // NEW VALIDATION - replaced cashCredit
    ];

    // Add conditional validation for date fields if contract type is "određeno"
    if (formData.vrstaUgovora === 'Na određeno') {
      validations.push(
        dateValidation(formData.datumOd),
        dateValidation(formData.datumDo)
      );
    }

    return validations.every(validation => validation.isValid);
  };

  // 🔧 NEW: Webhook submission function
  const handleWebhookSubmit = async () => {
    const webhookURL = "https://hook.eu2.make.com/kurmhpg8701g6qembh5nko2fve2ypk59";

    if (!isAgentLoggedIn) {
      alert('Molimo prijavite se s agentskom šifrom prije generiranja dokumenta.');
      return;
    }
    
    if (!isFormValid()) {
      alert('Molimo ispunite sva polja ispravno prije generiranja dokumenta.');
      return;
    }

    // Prepare payload with agent code
    const payload = {
      agentCode,
      timestamp: new Date().toISOString(),
      ...formData
    };

    try {
      console.log('🚀 Sending data to Make webhook:', payload);
      
      const response = await fetch(webhookURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const responseData = await response.text();
        console.log('✅ Webhook response:', responseData);
        alert("✅ Podaci su uspješno poslani Make scenariju!");
      } else {
        console.error('❌ Webhook error:', response.status, response.statusText);
        alert("⚠️ Nešto nije u redu. Provjerite webhook. Status: " + response.status);
      }
    } catch (error) {
      console.error("❌ Greška:", error);
      alert("❌ Greška prilikom povezivanja s Make webhookom. Provjerite internetsku vezu.");
    }
  };

  // Field definitions organized by sections
  const basicInfoFields = [
    {
      key: 'firstName',
      label: 'Ime',
      placeholder: 'Unesite vaše ime',
      validation: nameValidation,
      fieldType: 'text' as const
    },
    {
      key: 'lastName',
      label: 'Prezime',
      placeholder: 'Unesite vaše prezime',
      validation: nameValidation,
      fieldType: 'text' as const
    },
    {
      key: 'dateOfBirth',
      label: 'Datum rođenja',
      placeholder: 'Unesite datum rođenja (DD.MM.GGGG)',
      validation: dateValidation,
      fieldType: 'date' as const
    },
    {
      key: 'placeOfBirth',
      label: 'Mjesto rođenja',
      placeholder: 'Unesite mjesto rođenja',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'countryOfBirth',
      label: 'Država rođenja',
      placeholder: 'Unesite državu rođenja',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'citizenship1',
      label: 'Državljanstvo (1)',
      placeholder: 'Unesite prvo državljanstvo',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'citizenship2',
      label: 'Državljanstvo (2)',
      placeholder: 'Unesite drugo državljanstvo (opcionalno)',
      validation: optionalTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'citizenship3',
      label: 'Državljanstvo (3)',
      placeholder: 'Unesite treće državljanstvo (opcionalno)',
      validation: optionalTextValidation,
      fieldType: 'text' as const
    }
  ];

  const contactFields = [
    {
      key: 'email',
      label: 'Email',
      placeholder: 'Unesite vašu email adresu',
      validation: emailValidation,
      fieldType: 'email' as const
    },
    {
      key: 'mobileNumber',
      label: 'Broj mobitela',
      placeholder: 'Unesite broj mobitela (+385...)',
      validation: phoneValidation,
      fieldType: 'phone' as const
    }
  ];

  const addressFields = [
    {
      key: 'adresaPrebivalista',
      label: 'Adresa prebivališta',
      placeholder: 'Adresa (ulica, kućni broj, poštanski broj)',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'residencePlace',
      label: 'Mjesto prebivališta',
      placeholder: 'Unesite mjesto prebivališta',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'countryOfResidence',
      label: 'Država prebivališta',
      placeholder: 'Unesite državu prebivališta',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'stayOutsideRH',
      label: 'Boravište izvan RH',
      placeholder: 'Unesite boravište izvan RH (opcionalno)',
      validation: optionalTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'place',
      label: 'Mjesto',
      placeholder: 'Unesite mjesto',
      validation: basicTextValidation,
      fieldType: 'text' as const
    }
  ];

  const familyFields = [
    {
      key: 'householdMembers',
      label: 'Broj članova kućanstva',
      placeholder: 'Unesite broj članova kućanstva',
      validation: numberValidation,
      fieldType: 'number' as const
    },
    {
      key: 'dependentChildren',
      label: 'Broj uzdržavane djece',
      placeholder: 'Unesite broj uzdržavane djece',
      validation: numberValidation,
      fieldType: 'number' as const
    },
    {
      key: 'otherDependents',
      label: 'Broj ostalih uzdržavanih osoba',
      placeholder: 'Unesite broj ostalih uzdržavanih osoba',
      validation: numberValidation,
      fieldType: 'number' as const
    }
  ];

  const personalStatusFields = [
    {
      key: 'statusStanovanja',
      label: 'Status stanovanja',
      placeholder: 'Odaberite status stanovanja',
      validation: dropdownValidation,
      fieldType: 'dropdown' as const,
      options: statusStanovanjaOptions
    },
    {
      key: 'bracniStatus',
      label: 'Bračni status',
      placeholder: 'Odaberite bračni status',
      validation: dropdownValidation,
      fieldType: 'dropdown' as const,
      options: bracniStatusOptions
    },
    {
      key: 'obrazovanje',
      label: 'Obrazovanje',
      placeholder: 'Odaberite obrazovanje',
      validation: dropdownValidation,
      fieldType: 'dropdown' as const,
      options: obrazovanjeOptions
    }
  ];

  const documentsFields = [
    {
      key: 'identificationDocumentType',
      label: 'Vrsta identifikacijske isprave',
      placeholder: 'Odaberite vrstu isprave',
      validation: dropdownValidation,
      fieldType: 'dropdown' as const,
      options: identificationTypeOptions
    },
    {
      key: 'identificationDocumentNumber',
      label: 'Broj identifikacijske isprave',
      placeholder: 'Unesite broj identifikacijske isprave',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'identificationDocumentIssuer',
      label: 'Izdavatelj identifikacijske isprave',
      placeholder: 'Unesite izdavatelja isprave',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'identificationDocumentName',
      label: 'Naziv identifikacijske isprave',
      placeholder: 'Unesite naziv isprave (opcionalno)',
      validation: optionalTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'oib',
      label: 'OIB',
      placeholder: 'Unesite vaš OIB (11 brojeva)',
      validation: oibValidation,
      fieldType: 'oib' as const
    }
  ];

  const employmentFields = [
    {
      key: 'employerName',
      label: 'Naziv poslodavca',
      placeholder: 'Unesite naziv poslodavca',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'employerOIB',
      label: 'OIB poslodavca',
      placeholder: 'Unesite OIB poslodavca',
      validation: oibValidation,
      fieldType: 'oib' as const
    },
    {
      key: 'vrstaUgovora',
      label: 'Vrsta ugovora o zaposlenju',
      placeholder: 'Odaberite vrstu ugovora',
      validation: dropdownValidation,
      fieldType: 'dropdown' as const,
      options: vrstaUgovoraOptions
    },
    {
      key: 'workExperience',
      label: 'Radni staž kod sadašnjeg poslodavca (god.)',
      placeholder: 'Unesite broj godina radnog staža',
      validation: workExperienceValidation,
      fieldType: 'number' as const
    },
    {
      key: 'totalWorkExperience',
      label: 'Ukupni radni staž (god.)',
      placeholder: 'Unesite ukupan radni staž u godinama',
      validation: workExperienceValidation,
      fieldType: 'number' as const
    },
    {
      key: 'employmentStatus',
      label: 'Status zaposlenja',
      placeholder: 'Unesite vaš status zaposlenja',
      validation: basicTextValidation,
      fieldType: 'text' as const
    }
  ];

  // Conditional date fields for contract type
  const conditionalDateFields = formData.vrstaUgovora === 'Na određeno' ? [
    {
      key: 'datumOd',
      label: 'Od datuma',
      placeholder: 'Unesite početni datum ugovora (DD.MM.GGGG)',
      validation: dateValidation,
      fieldType: 'date' as const
    },
    {
      key: 'datumDo',
      label: 'Do datuma',
      placeholder: 'Unesite završni datum ugovora (DD.MM.GGGG)',
      validation: dateValidation,
      fieldType: 'date' as const
    }
  ] : [];

  const bankFields = [
    {
      key: 'bankName',
      label: 'Naziv banke',
      placeholder: 'Unesite naziv banke',
      validation: basicTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'acceptedBankOffer',
      label: 'Banka – prihvaćena ponuda',
      placeholder: 'Unesite naziv banke s prihvaćenom ponudom (opcionalno)',
      validation: optionalTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'rejectedBankRequest',
      label: 'Banka – odbijen zahtjev',
      placeholder: 'Unesite naziv banke koja je odbila zahtjev (opcionalno)',
      validation: optionalTextValidation,
      fieldType: 'text' as const
    },
    {
      key: 'odobreniIznosKredita',
      label: 'Odobreni iznos kredita',
      placeholder: 'Unesite iznos kredita u eurima',
      validation: numberValidation,
      fieldType: 'number' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Kompletni obrazac za unos podataka
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Koristite glas za unos podataka - držite mikrofon za snimanje
            </p>
            <p className="text-sm text-blue-600 mt-1">
              📱 Optimizirano za Bluetooth mikrofone na mobilnim uređajima
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Agent Login Section */}
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                {isAgentLoggedIn ? <Unlock className="h-5 w-5 text-green-600" /> : <Lock className="h-5 w-5 text-red-600" />}
                Prijava agenta
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={agentCode}
                      onChange={(e) => {
                        setAgentCode(e.target.value);
                        if (agentCodeError) setAgentCodeError("");
                      }}
                      disabled={isAgentLoggedIn}
                      placeholder="npr. 7, 25, 100"
                      className={cn(
                        "h-12 text-lg",
                        isAgentLoggedIn && "bg-gray-100 text-gray-700",
                        agentCodeError && "border-red-500"
                      )}
                    />
                  </div>
                  
                  {!isAgentLoggedIn ? (
                    <Button
                      onClick={handleAgentLogin}
                      disabled={!agentCode.trim()}
                      className="h-12 px-6 text-lg font-semibold"
                      size="lg"
                    >
                      <Lock className="mr-2 h-5 w-5" />
                      Login
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleAgentEdit}
                      className="h-12 px-6 text-lg"
                      size="lg"
                    >
                      <Edit3 className="mr-2 h-5 w-5" />
                      Edit
                    </Button>
                  )}
                </div>
                
                {agentCodeError && (
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    {agentCodeError}
                  </p>
                )}
                
                {isAgentLoggedIn && (
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <span className="text-green-500">✅</span>
                    Agent {agentCode} uspješno prijavljen
                  </p>
                )}
                
                {!isAgentLoggedIn && (
                  <p className="text-sm text-gray-600">
                    Unesite agentsku šifru (broj između 1 i 100). Automatski će se formatirati u 001, 002, 003...
                  </p>
                )}
              </div>
            </div>

            {/* Form sections - disabled when not logged in */}
            <div className={cn("space-y-8", !isAgentLoggedIn && "opacity-50 pointer-events-none")}>
              <FormSection
                title="Osnovni podaci"
                fields={basicInfoFields}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
              
              <FormSection
                title="Kontakt podaci"
                fields={contactFields}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
              
              <FormSection
                title="Adrese"
                fields={addressFields}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
              
              <FormSection
                title="Obitelj i kućanstvo"
                fields={familyFields}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
              
              <FormSection
                title="Osobni status"
                fields={personalStatusFields}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
              
              <FormSection
                title="Dokumenti"
                fields={documentsFields}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
              
              <FormSection
                title="Zaposlenje"
                fields={[...employmentFields, ...conditionalDateFields]}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
              
              <FormSection
                title="Banke i ponude"
                fields={bankFields}
                values={formData}
                onChange={handleFieldChange}
                disabled={!isAgentLoggedIn}
              />
            </div>
            
            <div className="pt-6">
              <Button
                onClick={handleWebhookSubmit}
                disabled={!isAgentLoggedIn || !isFormValid()}
                className={cn(
                  "w-full h-12 text-lg font-semibold text-white transition-all duration-200",
                  isAgentLoggedIn && isFormValid() 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gray-400 cursor-not-allowed"
                )}
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                {!isAgentLoggedIn ? "Prijavite se za generiranje dokumenta" : "Generiraj dokument"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default App;