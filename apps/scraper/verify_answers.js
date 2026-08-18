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
 * Query official Microsoft Learn Search API for real, live, canonical documentation links.
 */
async function fetchMicrosoftLearnDocs(query) {
  try {
    const cleanQuery = query.replace(/[^\w\s\-\.]/g, ' ').trim();
    const url = `https://learn.microsoft.com/api/search?search=${encodeURIComponent(cleanQuery)}&locale=en-us&$top=2`;
    const res = await fetch(url, { headers: { 'User-Agent': 'ProjectAtlas/1.0' } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.results)) return [];
    
    return data.results.map(item => ({
      title: item.title?.replace(/ - Microsoft Learn$/, '') || 'Microsoft Learn Documentation',
      url: item.url,
      description: (item.description || (item.descriptions?.[0]?.content) || '').replace(/\s+/g, ' ').trim()
    }));
  } catch (error) {
    console.error(`Error querying Microsoft Learn for query "${query}":`, error.message);
    return [];
  }
}

/**
 * Blind-solve, fact-check, and modernize taxonomy using official Microsoft Learn standards.
 */
async function blindSolveAndFactCheck(question, certification) {
  try {
    const prompt = `
You are the Principal Psychometrician and Lead Technical Exam Architect for ${certification?.name || 'Microsoft Certification'} (${certification?.exam_code || 'MS-102'}).

Your goal is to independently solve, fact-check, and modernize the following certification question according to current official Microsoft Learn documentation.

TAXONOMY & BRANDING REQUIREMENTS (2024-2026 STANDARD):
- Strictly enforce current official Microsoft branding:
  * 'Azure Active Directory' / 'Azure AD' -> 'Microsoft Entra ID'
  * 'Azure AD Privileged Identity Management' -> 'Microsoft Entra Privileged Identity Management (PIM)'
  * 'Azure AD Identity Protection' -> 'Microsoft Entra ID Protection'
  * 'Azure AD Conditional Access' -> 'Microsoft Entra Conditional Access'
  * 'Azure AD Connect' -> 'Microsoft Entra Connect'
  * 'Security & Compliance Center' -> 'Microsoft Defender XDR & Microsoft Purview'
  * 'Compliance Manager' / 'Information Protection' -> 'Microsoft Purview'
  * 'Microsoft Endpoint Manager' -> 'Microsoft Intune'

QUESTION CONTENT:
${question.content}

QUESTION TYPE:
${question.type}

AVAILABLE OPTIONS:
${JSON.stringify(question.options, null, 2)}

TASK:
1. Determine the objectively correct answer(s) strictly according to current Microsoft documentation.
2. Provide matching option IDs in 'solved_option_ids' (e.g. ["opt_0"] or ["opt_1", "opt_3"]).
3. Formulate a comprehensive, modern educational proof explanation detailing why the correct choice is right and specifically refuting distractors. Ensure all references use current Entra/Purview/Defender/Intune terminology.
4. Provide 1 to 2 highly specific search query strings in 'learn_search_queries' (e.g. ["Microsoft Entra ID Privileged Identity Management eligible assignment", "Microsoft Purview sensitivity labels auto labeling"]) to retrieve official Microsoft Learn articles.
5. Provide a confidence score from 0.0 to 1.0 in 'confidence_score'.

Respond strictly in JSON format matching this schema:
{
  "solved_option_ids": ["opt_..."],
  "confidence_score": 0.99,
  "learn_search_queries": [
    "Specific Microsoft Learn search phrase 1",
    "Specific Microsoft Learn search phrase 2"
  ],
  "proof_explanation": "Comprehensive technical proof using modern Microsoft Entra / Purview / Defender terminology...",
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
          content: "You are an elite, definitive ground-truth Microsoft exam verifier. Output valid, parseable JSON only."
        },
        { role: "user", content: contentPayload }
      ],
      response_format: { type: "json_object" }
    });

    const parsed = JSON.parse(response.choices[0].message.content);

    // Stage 2: Query Microsoft Learn API with the search queries
    const citations = [];
    const seenUrls = new Set();

    if (Array.isArray(parsed.learn_search_queries)) {
      for (const query of parsed.learn_search_queries.slice(0, 2)) {
        const docs = await fetchMicrosoftLearnDocs(query);
        for (const doc of docs) {
          if (!seenUrls.has(doc.url)) {
            seenUrls.add(doc.url);
            citations.push(doc);
          }
        }
      }
    }

    parsed.official_citations = citations;
    return parsed;
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
    console.log("   MICROSOFT LEARN GROUND-TRUTH VERIFICATION PIPELINE  ");
    console.log("=======================================================\n");

    examFilter = (await rl.question("1. Enter Certification Exam Code (e.g. MS-102, or press Enter for ALL): ")).trim();
    verifyAll = (await rl.question("2. Re-verify & modernize existing questions with Microsoft Learn API? (Y/n) [default: Y]: ")).trim().toLowerCase() !== 'n';
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
    console.log("No questions found matching your criteria.\n");
    process.exit(0);
  }

  console.log(`\nFound ${questions.length} question(s) to verify against Microsoft Learn API...\n`);

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
      console.log(`   📚 Microsoft Learn Links (${result.official_citations.length}):`);
      result.official_citations.forEach(c => {
        console.log(`      - ${c.title} -> ${c.url}`);
      });
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
      console.log(`   💾 Saved ground-truth record & canonical Learn links to Supabase.`);
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
