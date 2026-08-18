const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');

const url = env.split('NEXT_PUBLIC_SUPABASE_URL=')[1].split('\n')[0].trim();
const key = env.split('NEXT_PUBLIC_SUPABASE_ANON_KEY=')[1].split('\n')[0].trim();

const supabase = createClient(url, key);

async function check() {
  console.log("Checking certifications...");
  const { data: certs } = await supabase.from('certifications').select('*');
  console.log("Certs:");
  certs.forEach(c => console.log(c.exam_code));
  
  const sc300 = certs.find(c => c.exam_code === 'SC-300');
  if (sc300) {
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('certification_id', sc300.id);
    console.log("SC-300 Questions count:", count);
  }
}

check();
