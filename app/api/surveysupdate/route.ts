import { supabase } from "@/lib/supabaseClient"

export async function PUT(req: Request) {
  try {
    console.log("📩 Recibida solicitud PUT para actualizar encuesta")

    const data = await req.json()
    console.log("📦 Datos recibidos:", data)

    const { id, title, description, startDate, endDate, active, questions } = data

    if (!id) {
      console.error("❌ No se envió el ID de la encuesta")
      return Response.json({ success: false, error: "ID de encuesta requerido" }, { status: 400 })
    }

    // 1️⃣ Actualizar la encuesta principal
    console.log("🛠️ Actualizando encuesta:", id)
    const { error: surveyError } = await supabase
      .from("surveys")
      .update({
        title,
        description,
        starts_at: startDate,
        ends_at: endDate,
        is_active: active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (surveyError) throw surveyError
    console.log("✅ Encuesta actualizada correctamente")

    // 2️⃣ Obtener preguntas existentes
    const { data: existingQuestions, error: fetchError } = await supabase
      .from("questions")
      .select("id")
      .eq("survey_id", id)

    if (fetchError) throw fetchError
    console.log("📋 Preguntas existentes:", existingQuestions)

    const existingQuestionIds = existingQuestions.map((q) => q.id)

    // 3️⃣ Eliminar preguntas que ya no existan
    const newIds = questions.map((q: any) => q.id).filter((qid: any) => qid)
    const toDelete = existingQuestionIds.filter((qid: number) => !newIds.includes(qid))

    console.log("🧹 IDs a eliminar:", toDelete)

    if (toDelete.length > 0) {
      const delOptions = await supabase.from("options").delete().in("question_id", toDelete)
      console.log("🗑️ Eliminadas opciones:", delOptions)
      const delQuestions = await supabase.from("questions").delete().in("id", toDelete)
      console.log("🗑️ Eliminadas preguntas:", delQuestions)
    }

    // 4️⃣ Actualizar o insertar preguntas
    for (const q of questions) {
      console.log("🔁 Procesando pregunta:", q)

      if (q.id && existingQuestionIds.includes(q.id)) {
        // actualizar pregunta existente
        console.log("✏️ Actualizando pregunta existente ID:", q.id)
        const { error: qErr } = await supabase
          .from("questions")
          .update({
            text: q.text,
            prefix: q.prefix ?? null,
            description: q.description ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", q.id)

        if (qErr) throw qErr

        // limpiar opciones viejas
        await supabase.from("options").delete().eq("question_id", q.id)

        if (q.answers && q.answers.length > 0) {
          const opts = q.answers.map((a: any) => ({
            question_id: q.id,
            text: a.text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
          console.log("➕ Insertando nuevas opciones:", opts)
          const { error: optErr } = await supabase.from("options").insert(opts)
          if (optErr) throw optErr
        }
      } else {
        // nueva pregunta
        console.log("🆕 Insertando nueva pregunta:", q.text)
        const { data: qData, error: qErr } = await supabase
          .from("questions")
          .insert([
            {
              survey_id: id,
              dimension_id: 1,
              text: q.text,
              prefix: q.prefix ?? null,
              type: "multiple_choice",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select("id")
          .single()

        if (qErr) throw qErr

        if (q.answers && q.answers.length > 0) {
          const opts = q.answers.map((a: any) => ({
            question_id: qData.id,
            text: a.text,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }))
          console.log("➕ Insertando opciones para nueva pregunta:", opts)
          const { error: optErr } = await supabase.from("options").insert(opts)
          if (optErr) throw optErr
        }
      }
    }

    console.log("✅ Todo actualizado correctamente")
    return Response.json({ success: true })
  } catch (error: any) {
    console.error("❌ Error al actualizar encuesta:", error)
    return Response.json({ success: false, error: error.message })
  }
}
