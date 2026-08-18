import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../services/backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { data, error } = await supabase.from('questions').select('*').eq('source', 'dump');
  if (error) {
    console.error(error);
  } else {
    for (const q of data) {
      console.log('---');
      console.log('Type:', q.type);
      console.log('Content:\n' + q.content);
      console.log('Options:', JSON.stringify(q.options));
      console.log('Correct:', JSON.stringify(q.correct_answers));
      console.log('Explanation:', q.explanation);
    }
  }
}

main();
