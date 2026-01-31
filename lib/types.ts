
export enum DisabilityCategory {
  Autism = 'Autism',
  DeafBlindness = 'Deaf-Blindness',
  Deafness = 'Deafness',
  EmotionalDisturbance = 'Emotional Disturbance',
  HearingImpairment = 'Hearing Impairment',
  IntellectualDisability = 'Intellectual Disability',
  MultipleDisabilities = 'Multiple Disabilities',
  OrthopedicImpairment = 'Orthopedic Impairment',
  OtherHealthImpairment = 'Other Health Impairment',
  SpecificLearningDisability = 'Specific Learning Disability',
  SpeechLanguageImpairment = 'Speech or Language Impairment',
  TraumaticBrainInjury = 'Traumatic Brain Injury',
  VisualImpairment = 'Visual Impairment',
  DevelopmentalDelay = 'Developmental Delay',
  None = 'N/A (Staff/Admin)'
}

export interface FamilyMember {
  id: string;
  fullName: string;
  relation: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
}

export interface ProfessionalQualifications {
  citizenship: string;
  residency: string;
  education: string;
  eligibility: string;
  trainingHours: number;
  experienceYears: number;
  licenseNumber?: string;
  isSocialWorker: boolean;
}

export interface PwdIdMetadata {
  idNumber: string; // Format: CAR-BEN-LT-XXXXX
  issuedDate: string;
  expiryDate: string;
  issuingOfficer: string;
  issuingOffice: string; // e.g. PDAO La Trinidad
  causeOfDisability: string;
  qrCodeValue: string;
  signatureUrl?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  role: 'SuperAdmin' | 'Admin' | 'User';
  firstName: string;
  middleName?: string;
  lastName: string;
  address: string;
  birthDate: string;
  provincialAddress: string;
  civilStatus: string;
  occupation: string;
  sex: 'Male' | 'Female' | 'Other';
  bloodType: string;
  age: number;
  contactNumber: string;
  disabilityCategory: DisabilityCategory;
  familyComposition: FamilyMember[];
  emergencyContact: {
    name: string;
    relation: string;
    contact: string;
  };
  registrantType: 'Self' | 'Representative' | 'Guardian' | 'PDAO Staff';
  professionalQualifications?: ProfessionalQualifications;
  idMetadata?: PwdIdMetadata; // For users who have an issued ID
  accountConnection?: {
    platform: 'Gmail' | 'Facebook' | 'None';
    connectedAt: string;
  };
  status: 'Active' | 'Suspended' | 'Pending';
  photoUrl: string;
  customData: Record<string, string>; 
  history: {
    lostAndFound: LostReport[];
    programs: ProgramAvailment[];
  };
}

export interface Narrative {
   what: string;
   when: string;
   why: string;
   how: string;
}

export interface LostReport {
  id: string;
  userId: string;
  name: string;
  reporterId: string;
  timeMissing: string;
  lastSeen: string;
  description: string;
  clothes: string;
  height: string;
  bodyType: string;
  dissemination: {
    radio: boolean;
    socialMedia: boolean;
    context: string;
  };
  status: 'Missing' | 'Found' | 'Pending';
  isPosted: boolean; 
  missingNarrative?: Narrative;
  foundNarrative?: Narrative;
  photoUrl?: string;
}

export interface ProgramAvailment {
  id: string;
  userId: string;
  programType: 'ID' | 'Device' | 'Medical' | 'PhilHealth' | 'Livelihood';
  title: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed' | 'Ready for Claiming' | 'Out for Delivery';
  dateApplied: string;
  details?: string;
  paymentStatus?: 'Unpaid' | 'Paid';
  paymentMethod?: 'Online' | 'Upon Claiming';
  issuanceDate?: string;
  issuanceLocation?: string;
  adminNarrative?: Narrative;
  philhealthConsent?: boolean;
  deliveryMethod?: 'Pickup' | 'Delivery';
  deliveryDate?: string;
  deliveryCourier?: string;
  deliveryStatus?: string;
  requestedItemId?: string;
}

export interface AssistiveDevice {
  id: string;
  name: string;
  overview: string;
  organizers: string;
  benefits: string;
  description: string;
  eligibility: string;
  schedule: string;
  modeOfReceiving: string;
  category: string;
  stockCount: number;
  photoUrl?: string;
  photoAlt?: string;
  isVisible?: boolean;
  venue?: string;
}

export interface MedicalService {
  id: string;
  name: string;
  overview: string;
  organizers: string;
  skillSet: string[]; 
  benefits: string;
  eligibility: string;
  schedule: string;
  category: string;
  isVisible: boolean;
  photoUrl?: string;
  photoAlt?: string;
  assistanceDetail?: string;
  venue?: string;
}

export interface LivelihoodProgram {
  id: string;
  title: string;
  overview: string;
  organizers: string;
  skillSet: string[];
  schedule: string;
  benefits: string;
  venue: string;
  category: string;
  photoUrl?: string;
  isVisible?: boolean;
}

export interface FormSection {
  id: string;
  label: string;
}
