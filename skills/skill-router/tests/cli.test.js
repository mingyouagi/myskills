import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(__dirname, '../src/cli.js');

function runCli(args = []) {
  return new Promise((resolve) => {
    const proc = spawn('node', [cliPath, ...args], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

describe('CLI', () => {
  describe('help', () => {
    it('should show help with --help flag', async () => {
      const { code, stdout } = await runCli(['--help']);
      expect(code).toBe(0);
      expect(stdout).toContain('skill-router');
      expect(stdout).toContain('search');
      expect(stdout).toContain('route');
      expect(stdout).toContain('list');
      expect(stdout).toContain('detail');
    });

    it('should show help with -h flag', async () => {
      const { code, stdout } = await runCli(['-h']);
      expect(code).toBe(0);
      expect(stdout).toContain('skill-router');
    });

    it('should show help with no arguments', async () => {
      const { code, stdout } = await runCli([]);
      expect(code).toBe(0);
      expect(stdout).toContain('skill-router');
    });
  });

  describe('search command', () => {
    it('should search for skills', async () => {
      const { code, stdout } = await runCli(['search', 'skill']);
      expect(code).toBe(0);
      expect(stdout).toContain('skill-router');
    });

    it('should return no results for unknown query', async () => {
      const { code, stdout } = await runCli(['search', 'xyznonexistent123']);
      expect(code).toBe(0);
      expect(stdout).toContain('No matching skills found');
    });

    it('should error without query', async () => {
      const { code, stderr } = await runCli(['search']);
      expect(code).toBe(1);
      expect(stderr).toContain('Please provide a search query');
    });

    it('should support --limit option', async () => {
      const { code, stdout } = await runCli(['search', 'skill', '--limit', '1']);
      expect(code).toBe(0);
      // Should only show 1 result
      const matches = stdout.match(/^\d+\./gm);
      expect(matches?.length || 0).toBeLessThanOrEqual(1);
    });

    it('should support -l shorthand', async () => {
      const { code } = await runCli(['search', 'skill', '-l', '2']);
      expect(code).toBe(0);
    });

    it('should error on invalid limit', async () => {
      const { code, stderr } = await runCli(['search', 'skill', '--limit', 'abc']);
      expect(code).toBe(1);
      expect(stderr).toContain('--limit must be a positive integer');
    });

    it('should error on negative limit', async () => {
      const { code, stderr } = await runCli(['search', 'skill', '--limit', '-1']);
      expect(code).toBe(1);
      expect(stderr).toContain('--limit must be a positive integer');
    });

    it('should support --json output', async () => {
      const { code, stdout } = await runCli(['search', 'skill', '--json']);
      expect(code).toBe(0);
      const parsed = JSON.parse(stdout);
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('route command', () => {
    it('should route to best skill', async () => {
      const { code, stdout } = await runCli(['route', 'find a skill']);
      expect(code).toBe(0);
      expect(stdout).toContain('Recommended skill');
      expect(stdout).toContain('Confidence');
    });

    it('should return no match for unknown intent', async () => {
      const { code, stdout } = await runCli(['route', 'xyznonexistent123']);
      expect(code).toBe(0);
      expect(stdout).toContain('No matching skills found');
    });

    it('should error without intent', async () => {
      const { code, stderr } = await runCli(['route']);
      expect(code).toBe(1);
      expect(stderr).toContain('Please provide an intent description');
    });

    it('should support --json output', async () => {
      const { code, stdout } = await runCli(['route', 'find skill', '--json']);
      expect(code).toBe(0);
      const parsed = JSON.parse(stdout);
      expect(parsed === null || typeof parsed === 'object').toBe(true);
    });
  });

  describe('list command', () => {
    it('should list categories', async () => {
      const { code, stdout } = await runCli(['list']);
      expect(code).toBe(0);
      expect(stdout).toContain('[');
      expect(stdout).toContain('skills');
    });

    it('should support --json output', async () => {
      const { code, stdout } = await runCli(['list', '--json']);
      expect(code).toBe(0);
      const parsed = JSON.parse(stdout);
      expect(Array.isArray(parsed)).toBe(true);
    });
  });

  describe('detail command', () => {
    it('should show skill details', async () => {
      const { code, stdout } = await runCli(['detail', 'skill-router']);
      expect(code).toBe(0);
      expect(stdout).toContain('Name:');
      expect(stdout).toContain('ID:');
      expect(stdout).toContain('Path:');
    });

    it('should return not found for unknown skill', async () => {
      const { code, stdout } = await runCli(['detail', 'nonexistent-skill']);
      expect(code).toBe(0);
      expect(stdout).toContain('Skill not found');
    });

    it('should error without skill id', async () => {
      const { code, stderr } = await runCli(['detail']);
      expect(code).toBe(1);
      expect(stderr).toContain('Please provide a skill ID');
    });

    it('should support --json output', async () => {
      const { code, stdout } = await runCli(['detail', 'skill-router', '--json']);
      expect(code).toBe(0);
      const parsed = JSON.parse(stdout);
      expect(parsed === null || typeof parsed === 'object').toBe(true);
    });
  });

  describe('unknown command', () => {
    it('should error on unknown command', async () => {
      const { code, stderr } = await runCli(['unknown']);
      expect(code).toBe(1);
      expect(stderr).toContain('Unknown command');
    });
  });

  describe('--project option', () => {
    it('should accept project directory', async () => {
      const { code } = await runCli(['list', '--project', './nonexistent']);
      expect(code).toBe(0);
    });

    it('should accept -p shorthand', async () => {
      const { code } = await runCli(['list', '-p', './nonexistent']);
      expect(code).toBe(0);
    });
  });

  describe('--lang option', () => {
    it('should support Chinese output', async () => {
      const { code, stdout } = await runCli(['list', '--lang', 'zh']);
      expect(code).toBe(0);
      expect(stdout).toContain('个技能');
    });

    it('should support English output', async () => {
      const { code, stdout } = await runCli(['list', '--lang', 'en']);
      expect(code).toBe(0);
      expect(stdout).toContain('skills');
    });
  });
});
