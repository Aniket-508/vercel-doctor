import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { INSTALL_SKILL_URL } from "../constants.js";
import { highlighter } from "./highlighter.js";
import { logger } from "./logger.js";
import { prompts } from "./prompts.js";

const CONFIG_DIRECTORY = join(homedir(), ".vercel-doctor");
const CONFIG_FILE = join(CONFIG_DIRECTORY, "config.json");

interface SkillPromptConfig {
  skillPromptDismissed?: boolean;
}

const readSkillPromptConfig = (): SkillPromptConfig => {
  try {
    if (!existsSync(CONFIG_FILE)) return {};
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
};

const writeSkillPromptConfig = (config: SkillPromptConfig): void => {
  try {
    if (!existsSync(CONFIG_DIRECTORY)) {
      mkdirSync(CONFIG_DIRECTORY, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch {}
};

const installSkill = (): void => {
  try {
    execSync(`curl -fsSL ${INSTALL_SKILL_URL} | bash`, { stdio: "inherit" });
  } catch {
    logger.break();
    logger.dim("Skill install failed. You can install manually:");
    logger.dim(`  curl -fsSL ${INSTALL_SKILL_URL} | bash`);
  }
};

export const maybePromptSkillInstall = async (
  shouldSkipPrompts: boolean,
): Promise<void> => {
  const config = readSkillPromptConfig();
  if (config.skillPromptDismissed) return;
  if (shouldSkipPrompts) return;

  logger.break();
  logger.log(
    `${highlighter.info(
      "💡",
    )} Have your coding agent fix these issues automatically?`,
  );
  logger.dim(
    `   Install the ${highlighter.info(
      "vercel-doctor",
    )} skill to teach Cursor, Claude Code,`,
  );
  logger.dim("   and other AI agents how to diagnose and fix React issues.");
  logger.break();

  const { shouldInstall } = await prompts({
    type: "confirm",
    name: "shouldInstall",
    message: "Install skill? (recommended)",
    initial: true,
  });

  if (shouldInstall) {
    logger.break();
    installSkill();
  }

  writeSkillPromptConfig({ ...config, skillPromptDismissed: true });
};
