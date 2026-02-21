import { API_CORS_HEADERS } from "@/constants/api";
import getScoreLabel from "@/utils/get-score-label";
import { calculateScore } from "@/utils/calculate-score";
import { isValidDiagnostic } from "@/utils/validate-diagnostic";

export const OPTIONS = (): Response =>
  new Response(null, { status: 204, headers: API_CORS_HEADERS });

export const POST = async (request: Request): Promise<Response> => {
  const body = await request.json().catch(() => null);

  if (!body || !Array.isArray(body.diagnostics)) {
    return Response.json(
      { error: "Request body must contain a 'diagnostics' array" },
      { status: 400, headers: API_CORS_HEADERS },
    );
  }

  const isValidPayload = body.diagnostics.every((entry: unknown) => isValidDiagnostic(entry));

  if (!isValidPayload) {
    return Response.json(
      {
        error:
          "Each diagnostic must have 'filePath', 'plugin', 'rule', 'severity', 'message', 'help', 'line', 'column', and 'category'",
      },
      { status: 400, headers: API_CORS_HEADERS },
    );
  }

  const score = calculateScore(body.diagnostics);

  return Response.json({ score, label: getScoreLabel(score) }, { headers: API_CORS_HEADERS });
};
