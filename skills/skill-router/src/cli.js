#!/usr/bin/env node

import { searchSkills, routeSkill, listCategories, getSkillDetails } from './router.js';

const args = process.argv.slice(2);
const command = args[0];

// i18n messages
const messages = {
  zh: {
    title: 'skill-router - 技能发现和路由工具',
    usage: '用法',
    commands: '命令',
    options: '选项',
    defaultPaths: '默认搜索路径',
    examples: '示例',
    searchDesc: '搜索技能',
    routeDesc: '根据意图自动路由到最佳技能',
    listDesc: '列出所有技能分类',
    detailDesc: '查看技能详情',
    limitDesc: '限制结果数量 (默认: 5)',
    projectDesc: '指定项目技能目录',
    jsonDesc: '输出 JSON 格式',
    langDesc: '语言 (zh/en, 默认: zh)',
    noMatch: '没有找到匹配的技能',
    noSkills: '没有找到任何技能',
    skillNotFound: '技能不存在',
    recommended: '推荐技能',
    confidence: '置信度',
    command: '命令',
    name: '名称',
    id: 'ID',
    score: '分数',
    category: '分类',
    description: '描述',
    triggers: '触发词',
    path: '路径',
    skills: '个技能',
    errorLimit: '--limit 必须是正整数',
    errorProject: '--project 需要指定目录路径',
    errorQuery: '请提供搜索关键词',
    errorIntent: '请提供意图描述',
    errorSkillId: '请提供技能 ID',
    errorUnknown: '未知命令',
    error: '错误'
  },
  en: {
    title: 'skill-router - Skill discovery and routing tool',
    usage: 'Usage',
    commands: 'Commands',
    options: 'Options',
    defaultPaths: 'Default search paths',
    examples: 'Examples',
    searchDesc: 'Search for skills',
    routeDesc: 'Auto-route to best skill based on intent',
    listDesc: 'List all skill categories',
    detailDesc: 'Show skill details',
    limitDesc: 'Limit number of results (default: 5)',
    projectDesc: 'Specify project skills directory',
    jsonDesc: 'Output as JSON',
    langDesc: 'Language (zh/en, default: zh)',
    noMatch: 'No matching skills found',
    noSkills: 'No skills found',
    skillNotFound: 'Skill not found',
    recommended: 'Recommended skill',
    confidence: 'Confidence',
    command: 'Command',
    name: 'Name',
    id: 'ID',
    score: 'Score',
    category: 'Category',
    description: 'Description',
    triggers: 'Triggers',
    path: 'Path',
    skills: 'skills',
    errorLimit: '--limit must be a positive integer',
    errorProject: '--project requires a directory path',
    errorQuery: 'Please provide a search query',
    errorIntent: 'Please provide an intent description',
    errorSkillId: 'Please provide a skill ID',
    errorUnknown: 'Unknown command',
    error: 'Error'
  }
};

let lang = 'zh';
let t = messages.zh;

function printHelp() {
  console.log(`
${t.title}

${t.usage}:
  skill-router <command> [options]

${t.commands}:
  search <query>       ${t.searchDesc}
  route <intent>       ${t.routeDesc}
  list                 ${t.listDesc}
  detail <skill-id>    ${t.detailDesc}

${t.options}:
  --limit, -l <n>      ${t.limitDesc}
  --project, -p <dir>  ${t.projectDesc}
  --json               ${t.jsonDesc}
  --lang <zh|en>       ${t.langDesc}

${t.defaultPaths}:
  ~/.claude/superpowers/skills
  ~/.claude/skills

${t.examples}:
  skill-router search "debug"
  skill-router route "fix a bug"
  skill-router list
  skill-router detail superpowers:brainstorming
  skill-router search "test" -p ./.claude/skills
  skill-router list --lang en
`);
}

function parseOptions(args) {
  const options = { limit: 5, json: false, projectSkillsDir: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' || args[i] === '-l') {
      const limitStr = args[++i];
      const limit = parseInt(limitStr, 10);
      if (isNaN(limit) || limit < 1) {
        console.error(`${t.error}: ${t.errorLimit}, got: "${limitStr}"`);
        process.exit(1);
      }
      options.limit = limit;
    } else if (args[i] === '--json') {
      options.json = true;
    } else if (args[i] === '--project' || args[i] === '-p') {
      options.projectSkillsDir = args[++i];
      if (!options.projectSkillsDir) {
        console.error(`${t.error}: ${t.errorProject}`);
        process.exit(1);
      }
    } else if (args[i] === '--lang') {
      const langArg = args[++i];
      if (langArg === 'en' || langArg === 'zh') {
        lang = langArg;
        t = messages[lang];
      }
    }
  }
  return options;
}

function formatResults(results, json) {
  if (json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (!results || results.length === 0) {
    console.log(t.noMatch);
    return;
  }

  results.forEach((r, i) => {
    const confidence = r.score >= 70 ? 'HIGH' : r.score >= 40 ? 'MEDIUM' : 'LOW';
    console.log(`${i + 1}. ${r.name || r.id}`);
    console.log(`   ${t.id}: ${r.id}`);
    console.log(`   ${t.score}: ${r.score} (${confidence})`);
    if (r.category) console.log(`   ${t.category}: ${r.category}`);
    if (r.description) console.log(`   ${t.description}: ${r.description}`);
    console.log();
  });
}

async function main() {
  // Pre-parse lang option for help text
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang' && (args[i + 1] === 'en' || args[i + 1] === 'zh')) {
      lang = args[i + 1];
      t = messages[lang];
    }
  }

  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  const options = parseOptions(args.slice(1));
  const query = args[1];

  switch (command) {
    case 'search': {
      if (!query) {
        console.error(`${t.error}: ${t.errorQuery}`);
        process.exit(1);
      }
      const results = searchSkills(query, { limit: options.limit, projectSkillsDir: options.projectSkillsDir });
      formatResults(results, options.json);
      break;
    }

    case 'route': {
      if (!query) {
        console.error(`${t.error}: ${t.errorIntent}`);
        process.exit(1);
      }
      const result = routeSkill(query, { projectSkillsDir: options.projectSkillsDir });
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (result) {
        console.log(`${t.recommended}: ${result.skill.name || result.skill.id}`);
        console.log(`${t.confidence}: ${(result.confidence * 100).toFixed(0)}%`);
        console.log(`${t.command}: ${result.command}`);
      } else {
        console.log(t.noMatch);
      }
      break;
    }

    case 'list': {
      const categories = listCategories(options.projectSkillsDir);
      if (options.json) {
        console.log(JSON.stringify(categories, null, 2));
      } else if (categories.length === 0) {
        console.log(t.noSkills);
      } else {
        categories.forEach(cat => {
          console.log(`\n[${cat.category}] (${cat.count} ${t.skills})`);
          cat.skills.forEach(s => console.log(`  - ${s}`));
        });
      }
      break;
    }

    case 'detail': {
      if (!query) {
        console.error(`${t.error}: ${t.errorSkillId}`);
        process.exit(1);
      }
      const detail = getSkillDetails(query, options.projectSkillsDir);
      if (options.json) {
        console.log(JSON.stringify(detail, null, 2));
      } else if (detail) {
        console.log(`${t.name}: ${detail.name}`);
        console.log(`${t.id}: ${detail.id}`);
        if (detail.category) console.log(`${t.category}: ${detail.category}`);
        if (detail.description) console.log(`${t.description}: ${detail.description}`);
        if (detail.triggers?.length) console.log(`${t.triggers}: ${detail.triggers.join(', ')}`);
        console.log(`${t.path}: ${detail.path}`);
      } else {
        console.log(t.skillNotFound);
      }
      break;
    }

    default:
      console.error(`${t.errorUnknown}: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error(`${t.error}:`, err.message);
  process.exit(1);
});
