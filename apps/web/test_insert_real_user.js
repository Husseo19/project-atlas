const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('../../services/backend/.env', 'utf8');

const url = env.split('SUPABASE_URL=')[1].split('\n')[0].trim();
const key = env.split('SUPABASE_SERVICE_ROLE_KEY=')[1].split('\n')[0].trim();

const supabase = createClient(url, key);

async function testInsert() {
  const { data: certs } = await supabase.from('certifications').select('*').eq('exam_code', 'SC-300');
  const certId = certs[0].id;
  
  const { data: questions } = await supabase.from('questions').select('*').eq('certification_id', certId).limit(5);

  const { data: profiles } = await supabase.from('profiles').select('id').limit(1);
  if (!profiles || profiles.length === 0) return console.log("No users found");
  const userId = profiles[0].id;

  const sessionId = '00000000-0000-0000-0000-000000000001';
  
  const { error } = await supabase.from('sessions').insert({
    id: sessionId,
    user_id: userId,
    certification_id: certId,
    mode: 'training',
    status: 'in_progress',
    questions: questions.map(q => q.id)
  });
  
  console.log("Insert error with real user:", error);
  if (!error) {
     await supabase.from('sessions').delete().eq('id', sessionId);
  }
}

testInsert();
