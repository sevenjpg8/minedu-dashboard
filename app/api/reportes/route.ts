// app/api/reportes/route.ts
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

interface AnswerRow {
  id: number
  question: { id: number; text: string } | null
  option: { text: string } | null
  survey_participation: {
    survey_id: number
    school_id: number
    education_level: string
    grade: string
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const surveyId = searchParams.get("encuesta")
    const dreId = searchParams.get("dre")
    const ugelId = searchParams.get("ugel")
    const schoolId = searchParams.get("colegio")
    const nivelEducativo = searchParams.get("nivelEducativo")
    const grado = searchParams.get("grado")

    if (!surveyId) {
      return NextResponse.json({ success: false, message: "Falta encuesta" }, { status: 400 })
    }

    // 1️⃣ Obtener participaciones de la encuesta
    const { data: participations, error: pError } = await supabase
      .from("survey_participations")
      .select("id, survey_id, school_id, education_level, grade")
      .eq("survey_id", surveyId)

    if (pError) throw pError
    if (!participations || participations.length === 0)
      return NextResponse.json({ success: true, charts: [] })

    // 2️⃣ Filtrar participaciones según los parámetros
    let filteredParticipations = [...participations]
    //console.log("🎯 Parámetros recibidos:", { surveyId, dreId, ugelId, schoolId, nivelEducativo, grado })
    console.log("📊 Participaciones totales:", participations.length)

    if (dreId) {
      // 1️⃣ Obtener todas las UGELs de la DRE
      const { data: ugels, error: ugelError } = await supabase
        .from("ugel_new")
        .select("id")
        .eq("dre_id", Number(dreId));

      if (ugelError) throw ugelError;
      const ugelIds = ugels?.map((u) => Number(u.id)) || [];
      console.log("📋 UGEL IDs encontrados para DRE", dreId, ":", ugelIds);

      if (ugelIds.length === 0) {
        console.log("⚠️ Ninguna UGEL encontrada para DRE", dreId);
      }

      // 2️⃣ Obtener TODOS los colegios asociados a esas UGELs usando paginación
      let allSchools: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("school_new")
          .select("id, ugel_id")
          .in("ugel_id", ugelIds)
          .range(from, from + pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;

        allSchools.push(...data);
        hasMore = data.length === pageSize;
        from += pageSize;
      }

      const schoolsDreIds = allSchools.map((s) => Number(s.id));
      console.log("🏫 Total colegios encontrados (paginado):", schoolsDreIds.length);
      console.log("🧩 Incluye el colegio 45352?", schoolsDreIds.includes(45352));

      // 3️⃣ Filtrar participaciones según los colegios de la DRE
      filteredParticipations = filteredParticipations.filter((p) =>
        schoolsDreIds.includes(Number(p.school_id))
      );

      console.log("🎯 Participaciones luego del filtro DRE:", filteredParticipations.length);
    }

    
    if (ugelId) {
      const { data: schoolsUgel, error: ugelError } = await supabase
        .from("school_new")
        .select("id, ugel_id")
        .eq("ugel_id", ugelId)

      if (ugelError) throw ugelError

      const schoolsUgelIds = schoolsUgel?.map((s) => s.id) || []
      filteredParticipations = filteredParticipations.filter((p) =>
        schoolsUgelIds.includes(Number(p.school_id))
      )

      console.log("UGEL seleccionada:", ugelId)
      //console.log("Colegios UGEL:", schoolsUgelIds)
      console.log("Participaciones luego de UGEL:", filteredParticipations.length)
    }

    if (schoolId) {
      console.log("Colegio seleccionado:", schoolId)
      filteredParticipations = filteredParticipations.filter(
        (p) => String(p.school_id).trim() === String(schoolId).trim()
      )
      console.log("Participaciones luego de colegio:", filteredParticipations.length)
    }

    if (nivelEducativo)
      filteredParticipations = filteredParticipations.filter(
        (p) => p.education_level.toLowerCase() === nivelEducativo.toLowerCase()
      )


    if (grado)
      filteredParticipations = filteredParticipations.filter(
        (p) => p.grade === grado
      )

      if (schoolId) {
      console.log("Colegio seleccionado:", schoolId)
      console.log("Participaciones luego de colegio:", filteredParticipations.length)
    }

    if (nivelEducativo || grado) {
      console.log("Nivel:", nivelEducativo, "Grado:", grado)
      console.log("Participaciones luego de nivel/grado:", filteredParticipations.length)
    }


    // Si no quedan participaciones, no hay datos
    if (filteredParticipations.length === 0)
      return NextResponse.json({ success: true, charts: [] })

    // 3️⃣ Obtener respuestas de las participaciones filtradas
    const filteredIds = filteredParticipations.map((p) => p.id)

    const { data, error } = await supabase
      .from("answers")
      .select(`
        id,
        question:question_id(id, text),
        option:option_id(text)
      `)
      .in("survey_participation_id", filteredIds)
      .returns<AnswerRow[]>()

    if (error) throw error
    if (!data || data.length === 0)
      return NextResponse.json({ success: true, charts: [] })

    // 4️⃣ Agrupar por pregunta y opción
    const agrupado: Record<string, Record<string, number>> = {}

    for (const row of data) {
      const pregunta = row.question?.text || "Sin pregunta"
      const opcion = row.option?.text || "Sin opción"

      if (!agrupado[pregunta]) agrupado[pregunta] = {}
      if (!agrupado[pregunta][opcion]) agrupado[pregunta][opcion] = 0

      agrupado[pregunta][opcion]++
    }

    // 5️⃣ Convertir en formato para Recharts
    const charts = Object.entries(agrupado).map(([pregunta, opciones]) => {
      const firstRow = data.find((r) => r.question?.text === pregunta)
      return {
        id: firstRow?.question?.id ?? 0,
        question: pregunta,
        data: Object.entries(opciones).map(([name, count]) => ({
          name,
          "# de Respuestas": count,
        })),
      }
    })


    return NextResponse.json({ success: true, charts })
  } catch (err) {
    console.error("Error en /api/reportes:", err)
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500 }
    )
    
  }
  
}
