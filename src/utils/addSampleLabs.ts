import { supabase } from '@/lib/supabase';

// Sample vet data for testing
const sampleLaboratories = [
  {
    vet_name: 'Laboratoire Central Paris',
    address: '123 Rue de Rivoli',
    city: 'Paris',
    postal_code: '75001',
    phone: '01 42 60 30 30',
    email: 'contact@lab-central-paris.fr',
    latitude: 48.8606,
    longitude: 2.3376,
    services_offered: ['Analyses sanguines', 'Biochimie', 'Hématologie', 'Immunologie'],
    opening_hours: '8h00 - 18h00',
    is_verified: true
  },
  {
    vet_name: 'Bio-Lab Montparnasse',
    address: '45 Boulevard du Montparnasse',
    city: 'Paris',
    postal_code: '75006',
    phone: '01 45 48 55 55',
    email: 'contact@biolab-montparnasse.fr',
    latitude: 48.8448,
    longitude: 2.3266,
    services_offered: ['Analyses urinaires', 'Microbiologie', 'Immunologie', 'Parasitologie'],
    opening_hours: '7h30 - 19h00',
    is_verified: true
  },
  {
    vet_name: 'Laboratoire Saint-Germain',
    address: '78 Rue de Seine',
    city: 'Paris',
    postal_code: '75006',
    phone: '01 43 26 85 85',
    email: 'contact@lab-saint-germain.fr',
    latitude: 48.8534,
    longitude: 2.3364,
    services_offered: ['Biochimie', 'Endocrinologie', 'Génétique', 'Toxicologie'],
    opening_hours: '8h00 - 17h30',
    is_verified: true
  },
  {
    vet_name: 'Laboratoire Bastille',
    address: '15 Place de la Bastille',
    city: 'Paris',
    postal_code: '75011',
    phone: '01 43 57 42 42',
    email: 'contact@lab-bastille.fr',
    latitude: 48.8532,
    longitude: 2.3692,
    services_offered: ['Analyses sanguines', 'Biochimie', 'Cardiologie', 'Diabétologie'],
    opening_hours: '8h30 - 18h30',
    is_verified: true
  },
  {
    vet_name: 'Laboratoire Champs-Élysées',
    address: '102 Avenue des Champs-Élysées',
    city: 'Paris',
    postal_code: '75008',
    phone: '01 42 25 75 75',
    email: 'contact@lab-champs-elysees.fr',
    latitude: 48.8698,
    longitude: 2.3075,
    services_offered: ['Analyses complètes', 'Check-up', 'Médecine préventive', 'Nutrition'],
    opening_hours: '9h00 - 19h00',
    is_verified: true
  }
];

export const addSampleLaboratories = async () => {
  try {

    // First, create dummy users for the laboratories
    const userPromises = sampleLaboratories.map(async (lab, index) => {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: `lab${index + 1}@example.com`,
        password: 'password123',
        options: {
          data: {
            user_type: 'vet',
            clinic_name: lab.vet_name
          }
        }
      });

      if (authError) {

        return null;
      }

      return { ...lab, user_id: authData.user?.id };
    });

    const usersWithLabs = await Promise.all(userPromises);
    const validLabs = usersWithLabs.filter(lab => lab !== null && lab.user_id);

    if (validLabs.length === 0) {

      return;
    }

    // Insert vet profiles
    const { data, error } = await supabase
      .from('vet_profiles')
      .insert(validLabs);

    if (error) {

    } else {

    }

  } catch (error) {

  }
};

// Function to check existing laboratories
export const checkExistingLaboratories = async () => {
  try {
    const { data, error } = await supabase
      .from('vet_profiles')
      .select('*')
      .eq('is_verified', true);

    if (error) {

      return [];
    }

    return data || [];
  } catch (error) {

    return [];
  }
};

// Function to delete sample laboratories (for cleanup)
export const deleteSampleLaboratories = async () => {
  try {
    const { error } = await supabase
      .from('vet_profiles')
      .delete()
      .in('email', sampleLaboratories.map((_, index) => `lab${index + 1}@example.com`));

    if (error) {

    } else {

    }
  } catch (error) {

  }
};
