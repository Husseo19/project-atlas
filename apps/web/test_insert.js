const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');

const url = env.split('NEXT_PUBLIC_SUPABASE_URL=')[1].split('\n')[0].trim();
const key = env.split('NEXT_PUBLIC_SUPABASE_ANON_KEY=')[1].split('\n')[0].trim();

const supabase = createClient(url, key);

async function testInsert() {
  const { data: certs } = await supabase.from('certifications').select('*').eq('exam_code', 'SC-300');
  if (!certs || certs.length === 0) return console.log("SC-300 not found");
  
  const certId = certs[0].id;
  
  const { data: questions } = await supabase.from('questions').select('*').eq('certification_id', certId).limit(5);
  console.log("Questions fetched:", questions?.length);

  const sessionId = '00000000-0000-0000-0000-000000000001';
  // Use a known user or service role. Wait, I can't fake user_id without bypassing RLS or getting FK error.
  // The anon key will fail RLS if I try to insert for another user.
  // We'll see what the error is!
  
  // Actually, I'll fetch an existing user to use for the insert test.
  // Wait, I can't fetch users with anon key. Let's just try to insert with a random user id.
  const userId = '00000000-0000-0000-0000-000000000000';
  
  const { error } = await supabase.from('sessions').insert({
    id: sessionId,
    user_id: userId,
    certification_id: certId,
    mode: 'training',
    status: 'in_progress',
    questions: questions.map(q => q.id)
  });
  
  console.log("Insert error:", error);
}

testInsert();
