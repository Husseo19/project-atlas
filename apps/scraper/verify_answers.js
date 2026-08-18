import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Load environment variables from backend .env
dotenv.config({ path: path.resolve(process.cwd(), '../../services/backend/.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Blind-solve and fact-check a question without knowing the currently assigned answer.
 */
async function blindSolveAndFactCheck(question, certification) {
  try {
    const prompt = `
You are the Principal Psychometrician and Certification Subject Matter Expert for ${certification?.name || 'IT Certification'} (${certification?.exam_code || ''}).

Your goal is to independently solve and rigorously fact-check the following exam question using first-principles and official documentation guidelines (e.g. Microsoft Learn, Azure Architecture Center, RFCs).

CRITICAL: You are solving this blindly without any pre-existing answer to ensure unbiased, 100% accurate ground-truth verification.

QUESTION CONTENT:
${question.content}

QUESTION TYPE:
${question.type}

AVAILABLE OPTIONS:
${JSON.stringify(question.options, null, 2)}

TASK:
1. Carefully analyze the scenario, technical requirements, and any exhibit references.
2. Determine the objectively correct answer(s) strictly according to official vendor documentation.
3. Provide the exact matching option IDs in 'solved_option_ids' (e.g. ["opt_0"] or ["opt_1", "opt_3"]).
4. Formulate a definitive, educational proof explanation detailing why the correct choice is right and specifically refuting the distractors.
5. Provide 1 to 3 authoritative documentation references/citations in 'official_citations' (e.g. "Microsoft Learn: Create sensitivity labels and their policies").
6. Provide a confidence score from 0.0 to 1.0 in 'confidence_score'.

Respond strictly in JSON format matching this schema:
{
  "solved_option_ids": ["opt_..."],
  "confidence_score": 0.99,
  "official_citations": [
    "Microsoft Learn: Document / Feature Reference Title"
  ],
  "proof_explanation": "Comprehensive technical proof explaining the exact reason for the answer...",
  "is_question_ambiguous": false
}
`;

    // Extract any image URLs from question content to pass into Vision if needed
    const imageMatches = [...question.content.matchAll(/\[IMAGE:\s*(https?:\/\/[^\]\s]+)\]/g)];
    const contentPayload = [{ type: "text", text: prompt }];

    for (const match of imageMatches) {
      contentPayload.push({
        type: "image_url",
        image_url: { url: match[1] }
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite, definitive ground-truth exam verifier. Output valid, parseable JSON only."
        },
        { role: "user", content: contentPayload }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error(`Error blind-solving question ${question.id}:`, error);
    return null;
  }
}

async function runVerificationPipeline() {
  const args = process.argv.slice(2);
  let examFilter = '';
  let verifyAll = false;
  let limit = null;

  if (args.includes('--all')) {
    verifyAll = true;
  }
  const examIdx = args.indexOf('--exam');
  if (examIdx !== -1 && args[examIdx + 1]) {
    examFilter = args[examIdx + 1];
  }
  const limitIdx = args.indexOf('--limit');
  if (limitIdx !== -1 && args[limitIdx + 1]) {
    limit = parseInt(args[limitIdx + 1], 10);
  }

  if (args.length === 0) {
    const rl = readline.createInterface({ input, output });

    console.log("\n=======================================================");
    console.log("       AI GROUND-TRUTH ANSWER VERIFICATION PIPELINE     ");
    console.log("=======================================================\n");

    examFilter = (await rl.question("1. Enter Certification Exam Code to verify (e.g. MS-102, or press Enter for ALL): ")).trim();
    verifyAll = (await rl.question("2. Re-verify already verified questions? (y/N) [default: N]: ")).trim().toLowerCase() === 'y';
    const limitInput = (await rl.question("3. Max questions to verify (press Enter for ALL): ")).trim();
    limit = limitInput ? parseInt(limitInput, 10) : null;

    rl.close();
  }

  console.log("\nConnecting to Supabase and fetching target questions...");

  let query = supabase
    .from('questions')
    .select('*, certifications(name, exam_code)')
    .order('created_at', { ascending: false });

  if (examFilter) {
    // Lookup certification id
    const { data: cert } = await supabase.from('certifications').select('id').eq('exam_code', examFilter).single();
    if (cert) {
      query = query.eq('certification_id', cert.id);
    } else {
      console.warn(`Certification with exam code '${examFilter}' not found. Searching without cert filter...`);
    }
  }

  if (!verifyAll) {
    query = query.or('is_verified.is.null,is_verified.eq.false');
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data: questions, error } = await query;

  if (error || !questions) {
    console.error("Failed to query questions from Supabase:", error);
    process.exit(1);
  }

  if (questions.length === 0) {
    console.log("No unverified questions found matching your criteria! All questions are up to date. ✨\n");
    process.exit(0);
  }

  console.log(`\nFound ${questions.length} question(s) to verify. Beginning Blind-Solve Fact-Checking Pipeline...\n`);

  let verifiedCount = 0;
  let correctedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    console.log(`-------------------------------------------------------`);
    console.log(`[Question ${i + 1}/${questions.length}] ID: ${q.id} (${q.type})`);
    console.log(`Snippet: ${q.content.split('\n')[0].substring(0, 80)}...`);

    const result = await blindSolveAndFactCheck(q, q.certifications);

    if (!result || !Array.isArray(result.solved_option_ids) || result.solved_option_ids.length === 0) {
      console.warn(`⚠️ Verification failed or returned empty answer for question ${q.id}. Skipping.`);
      skippedCount++;
      continue;
    }

    // Compare original answer with verified solution
    const originalAnswers = Array.isArray(q.correct_answers) ? q.correct_answers : [];
    const solvedAnswers = result.solved_option_ids;

    // Check if sets match
    const isMatch = originalAnswers.length === solvedAnswers.length &&
      originalAnswers.every(ans => solvedAnswers.includes(ans));

    const status = isMatch ? 'verified' : 'corrected';
    const discrepancyDetected = !isMatch;

    if (isMatch) {
      console.log(`✅ Consensus Confirmed! Answer: ${JSON.stringify(solvedAnswers)} (Confidence: ${(result.confidence_score * 100).toFixed(0)}%)`);
      verifiedCount++;
    } else {
      console.log(`⚡ DISCREPANCY DETECTED & CORRECTED!`);
      console.log(`   Original Ingested Answer: ${JSON.stringify(originalAnswers)}`);
      console.log(`   Verified True Solution:   ${JSON.stringify(solvedAnswers)} (Confidence: ${(result.confidence_score * 100).toFixed(0)}%)`);
      correctedCount++;
    }

    if (result.official_citations && result.official_citations.length > 0) {
      console.log(`   Citations: ${result.official_citations.join(' | ')}`);
    }

    // Persist verified metadata back to Supabase
    const metadata = {
      verified_at: new Date().toISOString(),
      confidence_score: result.confidence_score,
      blind_solved_indices: solvedAnswers,
      discrepancy_detected: discrepancyDetected,
      original_ingested_answer: originalAnswers,
      official_citations: result.official_citations || [],
      is_question_ambiguous: result.is_question_ambiguous || false
    };

    const updatePayload = {
      is_verified: true,
      verification_status: status,
      verification_metadata: metadata,
      explanation: result.proof_explanation || q.explanation,
    };

    // If discrepancy was detected, update correct_answers to the true verified solution
    if (discrepancyDetected) {
      updatePayload.correct_answers = solvedAnswers;
    }

    const { error: updateError } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', q.id);

    if (updateError) {
      console.error(`Failed to update question ${q.id} in Supabase:`, updateError);
    } else {
      console.log(`   Saved verification record to database.`);
    }
  }

  console.log("\n=======================================================");
  console.log("             VERIFICATION PIPELINE SUMMARY             ");
  console.log("=======================================================");
  console.log(`Total Questions Processed: ${questions.length}`);
  console.log(`Consensus Verified:        ${verifiedCount} ✅`);
  console.log(`Discrepancies Corrected:   ${correctedCount} ⚡`);
  console.log(`Skipped / Inconclusive:    ${skippedCount} ⚠️`);
  console.log("=======================================================\n");
}

runVerificationPipeline().catch(console.error);
