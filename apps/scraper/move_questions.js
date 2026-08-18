import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../services/backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  let { data: cert } = await supabase.from('certifications').select('id').eq('exam_code', 'MS-102').single();
  if (!cert) {
    const res = await supabase.from('certifications').insert([{ name: 'Microsoft 365 Administrator', provider: 'Microsoft', version: '2023', exam_code: 'MS-102' }]).select('id').single();
    cert = res.data;
  }
  const ms102_id = cert.id;
  
  const { data, error } = await supabase.from('questions').update({ certification_id: ms102_id }).eq('source', 'dump').select();
  
  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Moved ${data.length} dump questions to MS-102.`);
  }
}

main();
