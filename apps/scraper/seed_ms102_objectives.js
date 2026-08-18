import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../services/backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data: cert } = await supabase.from('certifications').select('id').eq('exam_code', 'MS-102').single();
  if (!cert) {
    console.log("MS-102 not found");
    return;
  }
  
  const objectives = [
    { certification_id: cert.id, code: '1.0', description: 'Deploy and manage a Microsoft 365 tenant', weight: 25 },
    { certification_id: cert.id, code: '2.0', description: 'Implement and manage identity and access in Microsoft Entra ID', weight: 30 },
    { certification_id: cert.id, code: '3.0', description: 'Manage security and threats by using Microsoft 365 Defender', weight: 25 },
    { certification_id: cert.id, code: '4.0', description: 'Manage compliance by using Microsoft Purview', weight: 20 }
  ];
  
  const { data, error } = await supabase.from('study_objectives').insert(objectives).select();
  
  if (error) {
    console.error(error);
  } else {
    console.log(`Successfully seeded ${data.length} objectives for MS-102!`);
  }
}

main();
