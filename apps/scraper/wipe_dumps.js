import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../services/backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  const { error } = await supabase.from('questions').delete().eq('source', 'dump');
  if (error) {
    console.error(error);
  } else {
    console.log("Successfully wiped all old buggy dump questions.");
  }
}

main();
