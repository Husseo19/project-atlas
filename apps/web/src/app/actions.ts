'use server'

import { createClient } from '../utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'
import { getApiKeyAction } from './actions/auth'
import { redirect } from 'next/navigation'

export async function startExamSession(certificationId: string) {
  const supabase = createClient()
  
  // Get current user (if logged in)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to start an exam session.')
  }
  const userId = user.id
  
  // Check if dark mode (dump mode) is enabled
  const { data: profile } = await supabase.from('profiles').select('dark_mode_enabled').eq('id', userId).single()
  const source = profile?.dark_mode_enabled ? 'dump' : 'official'

  // 2. Fetch all questions for this certification
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('*')
    .eq('certification_id', certificationId)
    .eq('source', source)
    .limit(50) // Select up to 50 questions for an exam

  if (qError || !questions || questions.length === 0) {
    throw new Error('No questions available for this certification')
  }
  
  // Create a randomized subset if you want, but for now take all 50 fetched
  const questionIds = questions.map(q => q.id)
  
  // 3. Create the session in the DB
  const sessionId = uuidv4()
  
  const { error: sessionError } = await supabase
    .from('sessions')
    .insert({
      id: sessionId,
      user_id: userId,
      certification_id: certificationId,
      mode: 'exam',
      status: 'in_progress',
      questions: questionIds
    })
    
  if (sessionError) {
    console.error("Session creation error:", sessionError)
    throw new Error('Failed to create session')
  }
  
  return {
    sessionId,
    questions
  }
}

export async function submitExamSession(sessionId: string, answers: Record<string, string[]>) {
  const supabase = createClient()
  
  const { data: session } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
  if (!session) throw new Error('Session not found')
    
  const { data: questions } = await supabase.from('questions').select('*').in('id', session.questions)
  if (!questions) throw new Error('Questions not found')

  let totalCorrect = 0

  questions.forEach(q => {
    const userAns = [...(answers[q.id] || [])].sort()
    const correctAns = Array.isArray(q.correct_answers) ? [...q.correct_answers].sort() : (q.correctAnswer ? [q.correctAnswer].sort() : [])
    
    if (JSON.stringify(userAns) === JSON.stringify(correctAns)) {
      totalCorrect += 1
    }
  })

  const finalScore = Math.round((totalCorrect / questions.length) * 1000)
  const passed = finalScore >= 700

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      answers: answers,
      score: finalScore,
      passed: passed
    })
    .eq('id', sessionId)
    
  if (error) {
    throw new Error('Failed to submit exam')
  }
  
  return { success: true }
}

export async function getCertificationTrainingMeta(certificationCodeOrId: string) {
  const supabase = createClient()
  
  // Resolve certification by id or exam_code
  let certQuery = supabase.from('certifications').select('*')
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(certificationCodeOrId)) {
    certQuery = certQuery.eq('id', certificationCodeOrId)
  } else {
    certQuery = certQuery.eq('exam_code', certificationCodeOrId)
  }
  
  const { data: cert, error: certError } = await certQuery.single()
  if (certError || !cert) {
    throw new Error('Certification not found')
  }

  // Get current user and dark mode preference
  const { data: { user } } = await supabase.auth.getUser()
  let source = 'official'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('dark_mode_enabled').eq('id', user.id).single()
    if (profile?.dark_mode_enabled) {
      source = 'dump'
    }
  }

  // Fetch objectives for this certification
  const { data: objectives } = await supabase
    .from('study_objectives')
    .select('id, code, description')
    .eq('certification_id', cert.id)
    .order('code', { ascending: true })

  // Fetch questions count for this certification and source
  const { data: questions } = await supabase
    .from('questions')
    .select('id, objective_id')
    .eq('certification_id', cert.id)
    .eq('source', source)

  const questionList = questions || []
  const objectiveMap = new Map<string, number>()
  let unassignedCount = 0

  questionList.forEach(q => {
    if (q.objective_id) {
      objectiveMap.set(q.objective_id, (objectiveMap.get(q.objective_id) || 0) + 1)
    } else {
      unassignedCount++
    }
  })

  const objectivesWithCounts = (objectives || []).map(obj => ({
    id: obj.id,
    code: obj.code,
    description: obj.description,
    question_count: objectiveMap.get(obj.id) || 0
  }))

  return {
    certification: cert,
    objectives: objectivesWithCounts,
    unassignedQuestionCount: unassignedCount,
    totalQuestions: questionList.length,
    source
  }
}

export async function startCustomTrainingSession(params: {
  certificationId: string,
  selectedObjectiveIds?: string[],
  includeUnassigned?: boolean,
  questionCount?: number,
  isRandomized?: boolean,
  filterMode?: 'all' | 'missed' | 'unanswered'
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to start a training session.')
  }

  // Check dark mode preference
  const { data: profile } = await supabase.from('profiles').select('dark_mode_enabled').eq('id', user.id).single()
  const source = profile?.dark_mode_enabled ? 'dump' : 'official'

  const query = supabase
    .from('questions')
    .select('*')
    .eq('certification_id', params.certificationId)
    .eq('source', source)

  const { data: allQuestions, error: qError } = await query

  if (qError || !allQuestions || allQuestions.length === 0) {
    throw new Error('No questions available matching your criteria.')
  }

  let filteredPool = allQuestions

  // Filter by selected objectives if provided
  if (params.selectedObjectiveIds && params.selectedObjectiveIds.length > 0) {
    const objSet = new Set(params.selectedObjectiveIds)
    filteredPool = filteredPool.filter(q => {
      if (q.objective_id && objSet.has(q.objective_id)) return true
      if (!q.objective_id && params.includeUnassigned) return true
      return false
    })
  }

  // If filteredPool is empty, fallback to all available
  if (filteredPool.length === 0) {
    filteredPool = allQuestions
  }

  // Filter by history (unanswered) if requested
  if (params.filterMode === 'unanswered') {
    const { data: pastSessions } = await supabase
      .from('sessions')
      .select('answers')
      .eq('user_id', user.id)
      .eq('certification_id', params.certificationId)

    if (pastSessions && pastSessions.length > 0) {
      const answeredQuestionIds = new Set<string>()
      pastSessions.forEach(s => {
        if (s.answers && typeof s.answers === 'object') {
          Object.keys(s.answers).forEach(qid => answeredQuestionIds.add(qid))
        }
      })

      const unseen = filteredPool.filter(q => !answeredQuestionIds.has(q.id))
      if (unseen.length > 0) {
        filteredPool = unseen
      }
    }
  }

  // Randomize with Fisher-Yates shuffle if requested
  const isRandom = params.isRandomized !== false
  if (isRandom) {
    for (let i = filteredPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [filteredPool[i], filteredPool[j]] = [filteredPool[j], filteredPool[i]];
    }
  }

  const requestedCount = params.questionCount || 25
  const finalQuestions = filteredPool.slice(0, requestedCount)
  const questionIds = finalQuestions.map(q => q.id)

  const sessionId = uuidv4()
  const { error: sessionError } = await supabase
    .from('sessions')
    .insert({
      id: sessionId,
      user_id: user.id,
      certification_id: params.certificationId,
      mode: 'training',
      status: 'in_progress',
      questions: questionIds
    })

  if (sessionError) {
    console.error("Session creation error:", sessionError)
    throw new Error('Failed to create custom training session')
  }

  return {
    sessionId,
    questions: finalQuestions
  }
}

export async function startTrainingSession(certificationId: string) {
  return startCustomTrainingSession({ certificationId, questionCount: 25, isRandomized: true })
}

export async function submitTrainingSession(sessionId: string, answers: Record<string, string[]>) {
  const supabase = createClient()
  
  // 1. Fetch session and questions to calculate score
  const { data: session } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
  if (!session) throw new Error('Session not found')
    
  const { data: questions } = await supabase.from('questions').select('*').in('id', session.questions)
  if (!questions) throw new Error('Questions not found')

  // Calculate score and map by objective
  let totalCorrect = 0
  const objectiveStats: Record<string, { correct: number, total: number, code?: string, description?: string }> = {}

  // Fetch objective metadata to give the AI context instead of just UUIDs
  const { data: objectives } = await supabase.from('study_objectives').select('*').in('id', questions.map(q => q.objective_id).filter(Boolean))
  const objectiveMap = new Map(objectives?.map(o => [o.id, o]) || [])

  questions.forEach(q => {
    const objId = q.objective_id || 'unknown'
    if (!objectiveStats[objId]) {
      const objInfo = objectiveMap.get(objId)
      objectiveStats[objId] = { 
        correct: 0, 
        total: 0,
        code: objInfo?.code,
        description: objInfo?.description
      }
    }
    
    objectiveStats[objId].total += 1
    
    const userAns = [...(answers[q.id] || [])].sort()
    const correctAns = Array.isArray(q.correct_answers) ? [...q.correct_answers].sort() : (q.correctAnswer ? [q.correctAnswer].sort() : [])
    
    if (JSON.stringify(userAns) === JSON.stringify(correctAns)) {
      totalCorrect += 1
      objectiveStats[objId].correct += 1
    }
  })

  const finalScore = Math.round((totalCorrect / questions.length) * 100)
  let insights = null

  // 2. Generate AI Insights if API key is provided
  let apiKey = await getApiKeyAction()
  
  if (!apiKey) {
    // Check if user has bypass enabled
    const { data: profile } = await supabase.from('profiles').select('bypass_byo_key').eq('id', session.user_id).single()
    if (profile?.bypass_byo_key) {
      apiKey = process.env.OPENAI_API_KEY || null
    }
  }

  if (apiKey) {
    try {
      const openai = new OpenAI({ apiKey })
      const statsSummary = Object.entries(objectiveStats)
        .map(([obj, stats]) => {
          const name = stats.code ? `${stats.code}: ${stats.description}` : obj
          return `- ${name}: ${stats.correct}/${stats.total} correct`
        })
        .join('\n')

      const prompt = `
You are an expert AI tutor analyzing a student's performance on a recent certification training session.
Overall Score: ${finalScore}%

Breakdown by Objective:
${statsSummary}

Please provide a short, encouraging summary of their performance. Identify their strongest areas and their weakest areas based on the numbers. Give them exactly 3 actionable bullet points on what to study next. Format the response nicely in Markdown.
`
      const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
      })
      insights = completion.choices[0].message.content
    } catch (error) {
      console.error('Failed to generate insights:', error)
      insights = "AI Insights could not be generated at this time."
    }
  } else {
    insights = "Please add your OpenAI API Key in the Dashboard to unlock personalized AI Tutor insights for your training sessions!"
  }

  // 3. Update the session
  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      answers: answers,
      score: finalScore,
      passed: finalScore >= 70, // arbitrary passing score for training
      metadata: { insights, objectiveStats } // Store insights in metadata
    })
    .eq('id', sessionId)
    
  if (error) throw new Error('Failed to submit training')
  return { success: true, sessionId }
}

export async function startAdaptiveTrainingSession(previousSessionId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, bypass_byo_key, is_admin')
    .eq('id', user.id)
    .single()

  const isPremium = profile?.subscription_plan && profile.subscription_plan !== 'Free'
  const isBypassed = profile?.bypass_byo_key || profile?.is_admin

  if (!isPremium && !isBypassed) {
    throw new Error('UPGRADE_REQUIRED')
  }
  
  // 1. Get previous session to find weak objectives
  const { data: session } = await supabase.from('sessions').select('*').eq('id', previousSessionId).single()
  if (!session || !session.metadata || !session.metadata.objectiveStats) {
    throw new Error('Cannot generate adaptive session without previous stats')
  }

  const stats = session.metadata.objectiveStats as Record<string, { correct: number, total: number }>
  
  // Find objectives where the user scored less than 70% or sort by lowest percentage
  const weakObjectives = Object.entries(stats)
    .map(([objId, stat]) => ({ objId, pct: stat.correct / stat.total }))
    .sort((a, b) => a.pct - b.pct)
    .filter(x => x.pct < 1.0) // anything they didn't get perfect
    .map(x => x.objId)

  const targets = weakObjectives.length > 0 ? weakObjectives : Object.keys(stats) // fallback to all if they got 100%

  // 2. Fetch questions from weak objectives
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('certification_id', session.certification_id)
    .in('objective_id', targets)

  if (!questions || questions.length === 0) {
    throw new Error('No targeted questions found')
  }

  const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, 25)
  const questionIds = shuffled.map(q => q.id)

  const newSessionId = uuidv4()
  
  const { error: sessionError } = await supabase
    .from('sessions')
    .insert({
      id: newSessionId,
      user_id: session.user_id,
      certification_id: session.certification_id,
      mode: 'training',
      status: 'in_progress',
      questions: questionIds
    })
    
  if (sessionError) throw new Error('Failed to create adaptive session')
  
  return {
    sessionId: newSessionId,
    questions: shuffled
  }
}

export async function getSessionResult(sessionId: string) {
  const supabase = createClient()
  
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()
    
  if (error || !session) return null
  
  return {
    score: session.score || 0,
    passed: session.passed || false,
    questions: session.questions || [],
    id: session.id,
    metadata: session.metadata || null
  }
}

export async function getComments(questionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('question_comments')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch comments')
  }

  return data
}

export async function postComment(questionId: string, content: string, parentId?: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to post a comment')
  }

  const userName = user.user_metadata?.full_name || user.email || 'Student'

  const { data, error } = await supabase
    .from('question_comments')
    .insert({
      question_id: questionId,
      user_id: user.id,
      user_name: userName,
      content,
      parent_id: parentId || null
    })
    .select()
    .single()

  if (error) {
    console.error("Error posting comment:", error)
    throw new Error('Failed to post comment')
  }

  return data
}

export async function editComment(commentId: string, newContent: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to edit a comment')
  }

  const { data, error } = await supabase
    .from('question_comments')
    .update({ content: newContent })
    .eq('id', commentId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error("Error editing comment:", error)
    throw new Error('Failed to edit comment')
  }

  return data
}

export async function deleteComment(commentId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to delete a comment')
  }

  const { error } = await supabase
    .from('question_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    console.error("Error deleting comment:", error)
    throw new Error('Failed to delete comment')
  }

  return { success: true }
}

export async function scoreQuestion(questionId: string, score: number) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be authenticated to score a question')
  }

  const { data, error } = await supabase
    .from('question_scores')
    .upsert({
      question_id: questionId,
      user_id: user.id,
      score: score
    }, {
      onConflict: 'question_id, user_id'
    })
    .select()
    .single()

  if (error) {
    console.error("Error scoring question:", error)
    throw new Error('Failed to score question')
  }

  return data
}

export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ? { id: user.id } : null
}

export async function toggleBypassKey(userId: string, bypass: boolean) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify caller is admin
  const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!adminProfile?.is_admin) throw new Error('Not authorized')

  const { error } = await supabase.from('profiles').update({ bypass_byo_key: bypass }).eq('id', userId)
  if (error) throw new Error('Failed to update bypass status')
  return { success: true }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getPerformanceHistory(certificationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('You must be logged in to view performance history.')
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('certification_id', certificationId)
    .eq('status', 'completed')
    .order('start_time', { ascending: true })

  if (error) {
    console.error("Performance history error:", error)
    throw new Error('Failed to fetch performance history')
  }

  const timeline = sessions?.map(s => ({
    date: new Date(s.start_time).toLocaleDateString(),
    score: s.score || 0,
    type: s.mode
  })) || []

  const objStats: Record<string, { correct: number, total: number }> = {}
  sessions?.forEach(s => {
    if (s.metadata?.objectiveStats) {
      Object.entries(s.metadata.objectiveStats as any).forEach(([objId, stat]: [string, any]) => {
        if (!objStats[objId]) {
          objStats[objId] = { correct: 0, total: 0 }
        }
        objStats[objId].correct += stat.correct
        objStats[objId].total += stat.total
      })
    }
  })

  const { data: objectives } = await supabase.from('study_objectives').select('id, code, description').in('id', Object.keys(objStats))
  const objectiveMap = new Map(objectives?.map(o => [o.id, o]) || [])

  const weakestObjectives = Object.entries(objStats)
    .map(([objId, stat]) => {
      const objInfo = objectiveMap.get(objId)
      const name = objInfo?.code ? `${objInfo.code}: ${objInfo.description}` : objId
      return {
        name,
        accuracy: stat.total > 0 ? (stat.correct / stat.total) * 100 : 0
      }
    })
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3)

  const historyLog = sessions?.map(s => ({
    date: new Date(s.start_time).toLocaleDateString(),
    score: s.score || 0,
    mode: s.mode,
    insights: s.metadata?.insights || null
  })) || []

  return { timeline, weakestObjectives, historyLog }
}

export async function uploadSyllabusAction(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file uploaded');
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const pdfParse = require('pdf-parse');
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text;

  const openai = new OpenAI(); // Automatically uses process.env.OPENAI_API_KEY
  
  const prompt = `
Extract the following information from the syllabus text below:
- certification name
- provider
- exam code
- version (e.g., 2024)
- study objectives. IMPORTANT: You must extract BOTH the high-level macro objectives (e.g. 1.0) AND every single granular sub-objective/mini-objective (e.g., 1.1, 1.2, 1.3). Each objective must have a code, description, and weight as a number between 0 and 100. If it is a sub-objective, assign it the weight of its parent macro objective.

Respond ONLY in JSON format like this:
{
  "certification_name": "...",
  "provider": "...",
  "exam_code": "...",
  "version": "...",
  "objectives": [
    { "code": "1.0", "description": "High-level macro objective", "weight": 25 },
    { "code": "1.1", "description": "Granular sub-objective", "weight": 25 },
    { "code": "1.2", "description": "Granular sub-objective", "weight": 25 }
  ]
}

Text:
${text.substring(0, 30000)}
`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an AI syllabus extractor. Always respond in valid JSON format.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0].message.content || '{}';
  const extracted = JSON.parse(content);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables are missing.');
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: cert, error: certError } = await supabase
    .from('certifications')
    .upsert({
      name: extracted.certification_name,
      provider: extracted.provider,
      exam_code: extracted.exam_code,
      version: extracted.version
    }, { onConflict: 'exam_code' })
    .select()
    .single();

  if (certError || !cert) {
    console.error('Certification Error:', certError);
    throw new Error('Failed to insert certification');
  }

  const objectivesToInsert = extracted.objectives.map((obj: any) => ({
    certification_id: cert.id,
    code: obj.code,
    description: obj.description,
    weight: obj.weight
  }));

  const { error: objError } = await supabase
    .from('study_objectives')
    .upsert(objectivesToInsert, { onConflict: 'certification_id, code' });

  if (objError) {
    console.error('Objectives Error:', objError);
  }

  return {
    certification_id: cert.id,
    certification_name: cert.name,
    certification_code: cert.exam_code,
    objectives: extracted.objectives,
    created: true,
    result: {
      certification_name: cert.name,
      certification_code: cert.exam_code,
      objectives: extracted.objectives
    }
  };
}
