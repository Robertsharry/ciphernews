import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const body = (await request.json()) as {
    report_id?: string;
    payload?: { solved?: boolean } & Record<string, unknown>;
  };
  const reportId = body.report_id;
  if (!reportId) return NextResponse.json({ error: "report_id required" }, { status: 400 });

  const solved = !!body.payload?.solved;

  const { data: existing } = await supabase
    .from("puzzle_attempts")
    .select("id, tries, solved_at")
    .eq("user_id", user.id)
    .eq("report_id", reportId)
    .maybeSingle();

  const lastAnswer = (body.payload ?? null) as never;

  if (existing) {
    await supabase
      .from("puzzle_attempts")
      .update({
        tries: existing.tries + 1,
        solved_at: existing.solved_at ?? (solved ? new Date().toISOString() : null),
        last_answer: lastAnswer,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("puzzle_attempts").insert({
      user_id: user.id,
      report_id: reportId,
      tries: 1,
      solved_at: solved ? new Date().toISOString() : null,
      last_answer: lastAnswer,
    });
  }

  return NextResponse.json({ ok: true });
}
