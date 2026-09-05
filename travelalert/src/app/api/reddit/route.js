export async function GET() {
  return Response.json({ error: "gone" }, { status: 410 });
}