#!/usr/bin/env node

import { searchSkills, routeSkill, listCategories, getSkillDetails } from './router.js';

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
skill-router - 技能发现和路由工具

用法:
  skill-router <command> [options]

命令:
  search <query>       搜索技能
  route <intent>       根据意图自动路由到最佳技能
  list                 列出所有技能分类
  detail <skill-id>    查看技能详情

选项:
  --limit, -l <n>      限制结果数量 (默认: 5)
  --project, -p <dir>  指定项目技能目录
  --json               输出 JSON 格式

默认搜索路径:
  ~/.claude/superpowers/skills
  ~/.claude/skills

示例:
  skill-router search "debug"
  skill-router route "fix a bug"
  skill-router list
  skill-router detail superpowers:brainstorming
  skill-router search "test" -p ./.claude/skills
`);
}

function parseOptions(args) {
  const options = { limit: 5, json: false, projectSkillsDir: null };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' || args[i] === '-l') {
      const limitStr = args[++i];
      const limit = parseInt(limitStr, 10);
      if (isNaN(limit) || limit < 1) {
        console.error(`错误: --limit 必须是正整数，收到: "${limitStr}"`);
        process.exit(1);
      }
      options.limit = limit;
    } else if (args[i] === '--json') {
      options.json = true;
    } else if (args[i] === '--project' || args[i] === '-p') {
      options.projectSkillsDir = args[++i];
      if (!options.projectSkillsDir) {
        console.error('错误: --project 需要指定目录路径');
        process.exit(1);
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
    console.log('没有找到匹配的技能');
    return;
  }

  results.forEach((r, i) => {
    const confidence = r.score >= 70 ? 'HIGH' : r.score >= 40 ? 'MEDIUM' : 'LOW';
    console.log(`${i + 1}. ${r.name || r.id}`);
    console.log(`   ID: ${r.id}`);
    console.log(`   分数: ${r.score} (${confidence})`);
    if (r.category) console.log(`   分类: ${r.category}`);
    if (r.description) console.log(`   描述: ${r.description}`);
    console.log();
  });
}

async function main() {
  if (!command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  const options = parseOptions(args.slice(1));
  const query = args[1];

  switch (command) {
    case 'search': {
      if (!query) {
        console.error('错误: 请提供搜索关键词');
        process.exit(1);
      }
      const results = searchSkills(query, { limit: options.limit, projectSkillsDir: options.projectSkillsDir });
      formatResults(results, options.json);
      break;
    }

    case 'route': {
      if (!query) {
        console.error('错误: 请提供意图描述');
        process.exit(1);
      }
      const result = routeSkill(query, { projectSkillsDir: options.projectSkillsDir });
      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else if (result) {
        console.log(`推荐技能: ${result.skill.name || result.skill.id}`);
        console.log(`置信度: ${(result.confidence * 100).toFixed(0)}%`);
        console.log(`命令: ${result.command}`);
      } else {
        console.log('没有找到匹配的技能');
      }
      break;
    }

    case 'list': {
      const categories = listCategories(options.projectSkillsDir);
      if (options.json) {
        console.log(JSON.stringify(categories, null, 2));
      } else if (categories.length === 0) {
        console.log('没有找到任何技能');
      } else {
        categories.forEach(cat => {
          console.log(`\n[${cat.category}] (${cat.count} 个技能)`);
          cat.skills.forEach(s => console.log(`  - ${s}`));
        });
      }
      break;
    }

    case 'detail': {
      if (!query) {
        console.error('错误: 请提供技能 ID');
        process.exit(1);
      }
      const detail = getSkillDetails(query, options.projectSkillsDir);
      if (options.json) {
        console.log(JSON.stringify(detail, null, 2));
      } else if (detail) {
        console.log(`名称: ${detail.name}`);
        console.log(`ID: ${detail.id}`);
        if (detail.category) console.log(`分类: ${detail.category}`);
        if (detail.description) console.log(`描述: ${detail.description}`);
        if (detail.triggers?.length) console.log(`触发词: ${detail.triggers.join(', ')}`);
        console.log(`路径: ${detail.path}`);
      } else {
        console.log('技能不存在');
      }
      break;
    }

    default:
      console.error(`未知命令: ${command}`);
      printHelp();
      process.exit(1);
  }
}

main().catch(err => {
  console.error('错误:', err.message);
  process.exit(1);
});
