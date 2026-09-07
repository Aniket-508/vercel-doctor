export interface ReportDescriptor {
  node: EsTreeNode;
  message: string;
}

export interface RuleContext {
  report: (descriptor: ReportDescriptor) => void;
  getFilename?: () => string;
  sourceCode?: { text: string };
}

export type RuleVisitors = Record<
  string,
  ((node: EsTreeNode) => void) | (() => void)
>;

export interface Rule {
  create: (context: RuleContext) => RuleVisitors;
}

export interface RulePlugin {
  meta: { name: string };
  rules: Record<string, Rule>;
}

export interface EsTreeNode {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ESTree nodes have arbitrary dynamic properties
  [key: string]: any;
}
