// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { schoolId, academicYear } = await req.json()

    // 1. Fetch all student profiles for the school
    const { data: students } = await supabase
      .from('profiles')
      .select('id, current_grade')
      .eq('school_id', schoolId)
      .eq('role', 'student')

    if (!students || students.length === 0) throw new Error("No students found")

    const studentIds = students.map((s: any) => s.id)

    // 2. Fetch all HPC grades for these students
    const { data: grades } = await supabase
      .from('hpc_grades')
      .select('*')
      .in('student_id', studentIds)
      .eq('academic_year', academicYear)

    // 3. Aggregate Logic: Calculate competency distribution
    // Metrics: Academic, Socio-Emotional, and Physical Health
    const analytics = {
      total_students: students.length,
      grade_distribution: {},
      competency_averages: {
        academic: 0,
        socio_emotional: 0,
        physical: 0
      },
      nep_compliance_score: 0
    }

    grades?.forEach((grade: any) => {
      // Logic for Rolling up scores (Example: 1-4 scale)
      analytics.competency_averages.academic += grade.academic_score || 0
      analytics.competency_averages.socio_emotional += grade.socio_emotional_score || 0
      analytics.competency_averages.physical += grade.physical_score || 0
    })

    const count = grades?.length || 1
    analytics.competency_averages.academic /= count
    analytics.competency_averages.socio_emotional /= count
    analytics.competency_averages.physical /= count

    // 4. Store the Snapshot for Principal access
    const { data: snapshot, error: snapshotError } = await supabase
      .from('school_snapshots')
      .upsert({
        school_id: schoolId,
        academic_year: academicYear,
        data: analytics,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    return new Response(JSON.stringify(snapshot), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
