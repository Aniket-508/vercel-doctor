export type Framework =
  | "nextjs"
  | "nuxt"
  | "sveltekit"
  | "tanstack-start"
  | "astro"
  | "react-router"
  | "remix"
  | "solidstart"
  | "qwik"
  | "angular"
  | "vite"
  | "cra"
  | "gatsby"
  | "unknown";

export interface FrameworkDetector {
  framework: Framework;
  packages: string[];
}

export type LinterKind = "oxlint" | "rslint" | "eslint" | "biome" | "none";

export interface ProjectInfo {
  rootDirectory: string;
  projectName: string;
  reactVersion: string | null;
  vueVersion: string | null;
  svelteVersion: string | null;
  framework: Framework;
  nextVersion: string | null;
  nextMajorVersion: number | null;
  hasTypeScript: boolean;
  sourceFileCount: number;
}

export interface OxlintSpan {
  offset: number;
  length: number;
  line: number;
  column: number;
}

export interface OxlintLabel {
  label: string;
  span: OxlintSpan;
}

export interface OxlintDiagnostic {
  message: string;
  code: string;
  severity: "warning" | "error";
  causes: string[];
  url: string;
  help: string;
  filename: string;
  labels: OxlintLabel[];
  related: unknown[];
}

export interface OxlintOutput {
  diagnostics: OxlintDiagnostic[];
  number_of_files: number;
  number_of_rules: number;
}

export interface Diagnostic {
  filePath: string;
  plugin: string;
  rule: string;
  severity: "error" | "warning";
  message: string;
  help: string;
  line: number;
  column: number;
  category: string;
  weight?: number;
}

export interface PackageJson {
  name?: string;
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

export interface DependencyInfo {
  reactVersion: string | null;
  vueVersion: string | null;
  svelteVersion: string | null;
  framework: Framework;
  nextVersion: string | null;
  nextMajorVersion: number | null;
}

export interface KnipIssue {
  filePath: string;
  symbol: string;
  type: string;
}

export type KnipIssueRecords = Record<string, Record<string, KnipIssue>>;

export interface ScoreResult {
  score: number;
  label: string;
}

export interface ScanResult {
  diagnostics: Diagnostic[];
  scoreResult: ScoreResult | null;
}

export interface EstimatedScoreResult {
  currentScore: number;
  currentLabel: string;
  estimatedScore: number;
  estimatedLabel: string;
}

export interface ScanOptions {
  lint?: boolean;
  deadCode?: boolean;
  verbose?: boolean;
  scoreOnly?: boolean;
  offline?: boolean;
  includePaths?: string[];
  output?: "human" | "json" | "markdown";
  silent?: boolean;
}

export interface DiffInfo {
  currentBranch: string;
  baseBranch: string;
  changedFiles: string[];
  isCurrentChanges?: boolean;
}

export interface HandleErrorOptions {
  shouldExit: boolean;
}

export interface WorkspacePackage {
  name: string;
  directory: string;
}

export interface PromptMultiselectChoiceState {
  selected?: boolean;
  disabled?: boolean;
}

export interface PromptMultiselectContext {
  maxChoices?: number;
  cursor: number;
  value: PromptMultiselectChoiceState[];
  bell: () => void;
  render: () => void;
}

export interface KnipResults {
  issues: {
    files: Set<string>;
    dependencies: KnipIssueRecords;
    devDependencies: KnipIssueRecords;
    unlisted: KnipIssueRecords;
    exports: KnipIssueRecords;
    types: KnipIssueRecords;
    duplicates: KnipIssueRecords;
  };
  counters: Record<string, number>;
}

export interface CleanedDiagnostic {
  message: string;
  help: string;
}

export interface VercelDoctorIgnoreConfig {
  rules?: string[];
  files?: string[];
}

export interface VercelDoctorConfig {
  ignore?: VercelDoctorIgnoreConfig;
  lint?: boolean;
  deadCode?: boolean;
  verbose?: boolean;
  diff?: boolean | string;
}

export interface VercelCheckOptions {
  includePaths?: string[];
}

export interface VercelConfigCron {
  path: string;
  schedule: string;
}

export interface VercelConfigFunctionConfig {
  runtime?: string;
  maxDuration?: number;
}

export interface VercelConfig {
  crons?: VercelConfigCron[];
  functions?: Record<string, VercelConfigFunctionConfig>;
}

export interface StaticAssetCandidate {
  filePath: string;
  sizeBytes: number;
}

export interface RuleCategoryDetails {
  description: string;
  impact: string;
}

export interface RuleFixStrategy {
  title: string;
  before: string;
  after: string;
  explanation: string;
}

export interface PluginRuleMetadata {
  category: string;
  help: string;
  severity: "warn" | "error";
}

export interface LinterRunOptions {
  hasTypeScript: boolean;
  framework: Framework;
  includePaths?: string[];
}

export interface LinterRunner {
  kind: LinterKind;
  detect: (projectDirectory: string) => boolean;
  run: (
    rootDirectory: string,
    projectInfo: ProjectInfo,
    options: LinterRunOptions,
  ) => Promise<Diagnostic[]>;
}

export interface FrameworkCheckProvider {
  framework: Framework;
  collectFileDiagnostics: (
    relativeFilePath: string,
    fileContent: string,
    projectContext: ProjectInfo,
    diagnostics: Diagnostic[],
  ) => void;
  collectConfigDiagnostics?: (
    rootDirectory: string,
    projectFilePaths: string[],
    includedPathSet: Set<string> | null,
    diagnostics: Diagnostic[],
  ) => void;
}
