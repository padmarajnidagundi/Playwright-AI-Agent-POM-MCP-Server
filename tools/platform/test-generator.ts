import { AI_REPORT_SCHEMA_VERSION, TestGenerationPreview, TestGenerationRequest } from './schemas';

function titleFromPrompt(prompt: string): string {
  const cleaned = prompt.trim().replace(/\s+/g, ' ');
  return cleaned.length > 70 ? `${cleaned.slice(0, 67)}...` : cleaned;
}

function inferAssertions(prompt: string): string[] {
  const p = prompt.toLowerCase();
  const assertions: string[] = [];

  if (p.includes('login')) assertions.push('user can submit login form and see authenticated landing state');
  if (p.includes('search')) assertions.push('search results appear and contain relevant result cards');
  if (p.includes('error') || p.includes('invalid')) assertions.push('validation error state is visible for invalid input');
  if (assertions.length === 0) assertions.push('target page state is visible and navigation expectations are met');

  return assertions;
}

export function generateTestPreview(request: TestGenerationRequest): TestGenerationPreview {
  const testCases = inferAssertions(request.prompt);
  const describeTitle = titleFromPrompt(request.prompt);
  const constraintComment = request.constraints?.length ? `Constraints: ${request.constraints.join('; ')}` : 'Constraints: none';

  return {
    schemaVersion: AI_REPORT_SCHEMA_VERSION,
    request,
    pageObjectUpdates: [
      {
        file: request.targetPageObject,
        additions: [
          `Add resilient locator properties required for: ${describeTitle}`,
          'Add one action method per user interaction.',
          `Add assertion helpers aligned to generated cases. (${constraintComment})`,
        ],
      },
    ],
    specScaffold: {
      file: request.targetSpec,
      describeTitle,
      testCases,
    },
  };
}
