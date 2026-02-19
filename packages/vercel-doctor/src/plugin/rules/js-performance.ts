import { SEQUENTIAL_AWAIT_THRESHOLD, TEST_FILE_PATTERN } from "../constants.js";
import { walkAst } from "../helpers.js";
import type { EsTreeNode, Rule, RuleContext } from "../types.js";

export const asyncParallel: Rule = {
  create: (context: RuleContext) => {
    const filename = context.getFilename?.() ?? "";
    const isTestFile = TEST_FILE_PATTERN.test(filename);

    return {
      BlockStatement(node: EsTreeNode) {
        if (isTestFile) return;
        const consecutiveAwaitStatements: EsTreeNode[] = [];

        const flushConsecutiveAwaits = (): void => {
          if (consecutiveAwaitStatements.length >= SEQUENTIAL_AWAIT_THRESHOLD) {
            reportIfIndependent(consecutiveAwaitStatements, context);
          }
          consecutiveAwaitStatements.length = 0;
        };

        for (const statement of node.body ?? []) {
          const isAwaitStatement =
            (statement.type === "VariableDeclaration" &&
              statement.declarations?.length === 1 &&
              statement.declarations[0].init?.type === "AwaitExpression") ||
            (statement.type === "ExpressionStatement" &&
              statement.expression?.type === "AwaitExpression");

          if (isAwaitStatement) {
            consecutiveAwaitStatements.push(statement);
          } else {
            flushConsecutiveAwaits();
          }
        }
        flushConsecutiveAwaits();
      },
    };
  },
};

const reportIfIndependent = (statements: EsTreeNode[], context: RuleContext): void => {
  const declaredNames = new Set<string>();

  for (const statement of statements) {
    if (statement.type !== "VariableDeclaration") continue;
    const declarator = statement.declarations[0];
    const awaitArgument = declarator.init?.argument;

    let referencesEarlierResult = false;
    walkAst(awaitArgument, (child: EsTreeNode) => {
      if (child.type === "Identifier" && declaredNames.has(child.name)) {
        referencesEarlierResult = true;
      }
    });

    if (referencesEarlierResult) return;

    if (declarator.id?.type === "Identifier") {
      declaredNames.add(declarator.id.name);
    }
  }

  context.report({
    node: statements[0],
    message: `${statements.length} sequential await statements that appear independent — use Promise.all() for parallel execution`,
  });
};
