export interface CorporateInquiry {
  id: string;
  companyName: string;
  enterpriseName?: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone: string;
  employeeCount: string;
  industry: string;
  trainingNeeds: string[];
  budget: string;
  timeline: string;
  message: string;
  status: 'pending' | 'contacted' | 'quoted' | 'converted' | 'closed';
  submittedAt: string;
  updatedAt: string;
}

// Corporate inquiry management functions  
const corporateInquiries: CorporateInquiry[] = [];

export function createCorporateInquiry(inquiry: Omit<CorporateInquiry, 'id' | 'submittedAt' | 'updatedAt'>): Promise<CorporateInquiry> {
  return new Promise((resolve) => {
    // Simulate API call
    setTimeout(() => {
      const newInquiry: CorporateInquiry = {
        ...inquiry,
        id: `inquiry_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // In a real app, this would save to database/localStorage
      corporateInquiries.push(newInquiry);
      console.log('Corporate inquiry created:', newInquiry);
      
      resolve(newInquiry);
    }, 500);
  });
}

export function getCorporateInquiries(): CorporateInquiry[] {
  return corporateInquiries;
}

export function updateCorporateInquiry(id: string, updates: Partial<CorporateInquiry>): CorporateInquiry | null {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return null;
  
  corporateInquiries[index] = {
    ...corporateInquiries[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  return corporateInquiries[index];
}

export function deleteCorporateInquiry(id: string): boolean {
  const index = corporateInquiries.findIndex(inquiry => inquiry.id === id);
  if (index === -1) return false;
  
  corporateInquiries.splice(index, 1);
  return true;
}