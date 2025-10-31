import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const schoolId = searchParams.get("school_id"); // ejemplo de filtro

  try {
    // Consulta respuestas + preguntas + opciones
    const { data, error } = await supabase
      .from("answers")
      .select(`
        question_id,
        option_id,
        options (id, text),
        questions (id, text)
      `)
      .eq("school_id", schoolId ?? ""); // puedes quitar esto si no hay filtro

    if (error) throw error;

    // Agrupar resultados por pregunta
    const grouped = data.reduce((acc: any, row: any) => {
      const qid = row.questions.id;
      const qtext = row.questions.text;
      const optText = row.options?.text ?? "Sin opción";

      if (!acc[qid]) acc[qid] = { question: qtext, results: {} };
      acc[qid].results[optText] = (acc[qid].results[optText] || 0) + 1;

      return acc;
    }, {});

    // Convertir el agrupado a un array amigable para el frontend
    const formatted = Object.values(grouped).map((q: any) => ({
      question: q.question,
      data: Object.entries(q.results).map(([name, value]) => ({
        name,
        value,
      })),
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Error en /api/answers:", err);
    return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 });
  }
}
