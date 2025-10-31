import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const encuesta = searchParams.get("encuesta");
  const dre = searchParams.get("dre");
  const ugel = searchParams.get("ugel");
  const colegio = searchParams.get("colegio");
  const grado = searchParams.get("grado");

  if (!encuesta) {
    return NextResponse.json({ success: false, error: "Debe seleccionar una encuesta" }, { status: 400 });
  }

  console.log("📊 Filtros recibidos:", { encuesta, dre, ugel, colegio, grado });

  try {
    // 🔹 Obtenemos todas las preguntas de la encuesta
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select("id, text")
      .eq("survey_id", encuesta);

    if (qError) throw qError;
    console.log(`📋 ${questions.length} preguntas encontradas`);

    // 🔹 Obtenemos todas las respuestas (answers) de esas preguntas
    const questionIds = questions.map((q) => q.id);

    let query = supabase
      .from("answers")
      .select(`
        question_id,
        option_id,
        options (id, text),
        questions (id, text),
        survey_participations!inner(
          school_id,
          grade,
          schools!inner(
            id,
            ugel_id,
            ugels!inner(
              id,
              dre_id
            )
          )
        )
      `)
      .in("question_id", questionIds);

    // 🔹 Aplicamos los filtros dinámicos
    if (grado) query = query.eq("survey_participations.grade", grado);
    if (colegio) query = query.eq("survey_participations.school_id", colegio);
    if (ugel) query = query.eq("survey_participations.schools.ugel_id", ugel);
    if (dre) query = query.eq("survey_participations.schools.ugels.dre_id", dre);

    const { data: answers, error: aError } = await query;

    if (aError) throw aError;
    console.log(`🧾 ${answers.length} respuestas encontradas`);

    // 🔹 Agrupamos respuestas por pregunta y opción
    const grouped = answers.reduce((acc: any, row: any) => {
      const qid = row.questions.id;
      const qtext = row.questions.text;
      const optText = row.options?.text ?? "Sin opción";

      if (!acc[qid]) acc[qid] = { question: qtext, results: {} };
      acc[qid].results[optText] = (acc[qid].results[optText] || 0) + 1;

      return acc;
    }, {});

    // 🔹 Convertimos a formato compatible con Recharts
    const formatted = Object.values(grouped).map((q: any) => ({
      question: q.question,
      data: Object.entries(q.results).map(([name, value]) => ({
        name,
        "# de Respuestas": value,
      })),
    }));

    console.log("✅ Datos formateados para frontend:", formatted.slice(0, 2));

    return NextResponse.json({ success: true, charts: formatted });
  } catch (err) {
    console.error("❌ Error en /api/reportes:", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
