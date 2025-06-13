export interface FormData {
  // Osnovni podaci
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  countryOfBirth: string;
  citizenship1: string;
  citizenship2: string;
  citizenship3: string;
  
  // Kontakt podaci
  email: string;
  mobileNumber: string;
  
  // Adrese
  adresaPrebivalista: string; // NEW FIELD - replaced residenceAddress
  residencePlace: string;
  countryOfResidence: string; // NEW FIELD
  stayOutsideRH: string;
  place: string;
  
  // Obitelj i kućanstvo
  householdMembers: string;
  dependentChildren: string;
  otherDependents: string;
  
  // Status i osobni podaci
  statusStanovanja: string;
  bracniStatus: string;
  obrazovanje: string;
  
  // Dokumenti
  identificationDocumentType: string;
  identificationDocumentNumber: string;
  identificationDocumentIssuer: string;
  identificationDocumentName: string;
  oib: string;
  
  // Zaposlenje
  employerName: string;
  employerOIB: string;
  vrstaUgovora: string;
  datumOd: string;
  datumDo: string;
  workExperience: string;
  totalWorkExperience: string;
  employmentStatus: string;
  
  // Banke i ponude
  acceptedBankOffer: string;
  rejectedBankRequest: string;
  bankName: string;
  odobreniIznosKredita: string; // NEW FIELD - replaced cashCredit
  
  // Legacy fields (keeping for compatibility)
  residence: string;
  residenceStatus: string;
  identificationDocument: string;
  employmentContract: string;
  cashCredit: string; // Keep for backward compatibility
  residenceAddress: string; // Keep for backward compatibility
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export type ValidationRule = (value: string) => ValidationResult;

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}