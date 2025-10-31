import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ugelId = searchParams.get("ugelId");
  const query = searchParams.get("query");

  if (!ugelId || !query) {
    return NextResponse.json([]);
  }

  const { data, error } = await supabase
    .from("schools")
    .select("id, name, nivel_educativo")
    .eq("ugel_id", ugelId)
    .ilike("name", `%${query}%`)
    .limit(20);

  if (error) {
    console.error(error);
    return NextResponse.json([]);
  }

  return NextResponse.json(data);
}
