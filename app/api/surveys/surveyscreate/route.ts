import { supabase } from "@/lib/supabaseClient"

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { title, description, startDate, endDate, active, questions } = data

    // 1️⃣ Crear la encuesta
    const { data: surveyData, error: surveyError } = await supabase
      .from("surveys")
      .insert([
        {
          title,
          description,
          starts_at: startDate,
          ends_at: endDate,
          is_active: active ?? true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select("id")
      .single()

    if (surveyError) throw surveyError
    const surveyId = surveyData.id

    // 2️⃣ Insertar preguntas
    for (const q of questions) {
      const { data: questionData, error: questionError } = await supabase
        .from("questions")
        .insert([
          {
            survey_id: surveyId,
            dimension_id: 1, // 👈 Valor en duro temporal
            text: q.text,
            type: "multiple_choice", // 👈 Valor por defecto temporal
            prefix: q.prefix,   
            order: q.order ?? 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single()

      if (questionError) throw questionError
      const questionId = questionData.id

      // 3️⃣ Insertar opciones
      if (q.answers && q.answers.length > 0) {
        const optionsToInsert = q.answers.map((a: any) => ({
          question_id: questionId,
          text: a.text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

        const { error: optionsError } = await supabase
          .from("options")
          .insert(optionsToInsert)

        if (optionsError) throw optionsError
      }
    }

    return Response.json({ success: true })
  } catch (error: any) {
    console.error("❌ Error al crear encuesta:", error)
    return Response.json({ success: false, error: error.message })
  }
}
