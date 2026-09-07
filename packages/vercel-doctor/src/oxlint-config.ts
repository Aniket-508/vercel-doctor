import {
  BASE_PLUGIN_RULE_ID_LIST,
  getQualifiedPluginRuleId,
  NEXTJS_PLUGIN_RULE_ID_LIST,
  NUXT_PLUGIN_RULE_ID_LIST,
  SVELTEKIT_PLUGIN_RULE_ID_LIST,
} from "./rule-ids.js";
import { PLUGIN_RULE_METADATA } from "./rule-metadata.js";
import type { Framework } from "./types.js";

const createPluginRuleConfig = (ruleIds: string[]): Record<string, string> => {
  const pluginRuleConfig: Record<string, string> = {};

  for (const ruleId of ruleIds) {
    const ruleMetadata = PLUGIN_RULE_METADATA[ruleId];

    if (ruleMetadata) {
      pluginRuleConfig[getQualifiedPluginRuleId(ruleId)] =
        ruleMetadata.severity;
    }
  }

  return pluginRuleConfig;
};

const BASE_PLUGIN_RULES = createPluginRuleConfig(BASE_PLUGIN_RULE_ID_LIST);

const NEXTJS_RULES = createPluginRuleConfig(NEXTJS_PLUGIN_RULE_ID_LIST);

const NUXT_RULES = createPluginRuleConfig(NUXT_PLUGIN_RULE_ID_LIST);

const SVELTEKIT_RULES = createPluginRuleConfig(SVELTEKIT_PLUGIN_RULE_ID_LIST);

interface OxlintConfigOptions {
  pluginPath: string;
  framework: Framework;
}

export const createOxlintConfig = ({
  pluginPath,
  framework,
}: OxlintConfigOptions) => ({
  categories: {
    correctness: "off",
    nursery: "off",
    pedantic: "off",
    perf: "off",
    restriction: "off",
    style: "off",
    suspicious: "off",
  },
  jsPlugins: [pluginPath],
  plugins: [],
  rules: {
    ...BASE_PLUGIN_RULES,
    ...(framework === "nextjs" ? NEXTJS_RULES : {}),
    ...(framework === "nuxt" ? NUXT_RULES : {}),
    ...(framework === "sveltekit" ? SVELTEKIT_RULES : {}),
  },
});
