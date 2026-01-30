import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { EventEmitter } from 'events';

const MANIFEST_FILE = '.skill-manifest.json';

class SkillWatcher extends EventEmitter {
  constructor(skillDirs, options = {}) {
    super();
    this.skillDirs = skillDirs;
    this.options = {
      pollInterval: options.pollInterval || 30000,
      enableFileWatch: options.enableFileWatch ?? true,
      enableGitCheck: options.enableGitCheck ?? false,
      debounceMs: options.debounceMs || 500,
      manifestDir: options.manifestDir || skillDirs[0]?.basePath || '/tmp',
      ...options
    };
    
    this.manifest = null;
    this.watchers = [];
    this.debounceTimer = null;
    this.pollTimer = null;
  }

  computeSkillHash(skillPath) {
    const skillFile = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillFile)) return null;
    
    try {
      const content = fs.readFileSync(skillFile, 'utf8');
      const stat = fs.statSync(skillFile);
      return crypto
        .createHash('md5')
        .update(content)
        .update(stat.mtime.toISOString())
        .digest('hex');
    } catch {
      return null;
    }
  }

  scanSkillDirs() {
    const skills = {};
    
    for (const { basePath, namespace } of this.skillDirs) {
      if (!fs.existsSync(basePath)) continue;
      
      const scanDir = (dir, depth = 0) => {
        if (depth > 3) return;
        
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            
            const fullPath = path.join(dir, entry.name);
            const skillFile = path.join(fullPath, 'SKILL.md');
            
            if (fs.existsSync(skillFile)) {
              const skillId = namespace ? `${namespace}:${entry.name}` : entry.name;
              skills[skillId] = {
                path: fullPath,
                hash: this.computeSkillHash(fullPath),
                namespace
              };
            }
            
            scanDir(fullPath, depth + 1);
          }
        } catch {}
      };
      
      scanDir(basePath);
    }
    
    return skills;
  }

  loadManifest() {
    const manifestPath = path.join(this.options.manifestDir, MANIFEST_FILE);
    try {
      if (fs.existsSync(manifestPath)) {
        return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      }
    } catch {}
    return { version: 1, skills: {}, lastCheck: null };
  }

  saveManifest(manifest) {
    const manifestPath = path.join(this.options.manifestDir, MANIFEST_FILE);
    try {
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    } catch {}
  }

  detectChanges() {
    const currentSkills = this.scanSkillDirs();
    const previousManifest = this.manifest || this.loadManifest();
    const previousSkills = previousManifest.skills || {};
    
    const changes = {
      added: [],
      updated: [],
      removed: [],
      timestamp: new Date().toISOString()
    };

    for (const [skillId, current] of Object.entries(currentSkills)) {
      const previous = previousSkills[skillId];
      
      if (!previous) {
        changes.added.push({ id: skillId, path: current.path });
      } else if (previous.hash !== current.hash) {
        changes.updated.push({ id: skillId, path: current.path, oldHash: previous.hash, newHash: current.hash });
      }
    }

    for (const skillId of Object.keys(previousSkills)) {
      if (!currentSkills[skillId]) {
        changes.removed.push({ id: skillId, path: previousSkills[skillId].path });
      }
    }

    const hasChanges = changes.added.length > 0 || changes.updated.length > 0 || changes.removed.length > 0;

    if (hasChanges) {
      this.manifest = {
        version: 1,
        skills: currentSkills,
        lastCheck: changes.timestamp
      };
      this.saveManifest(this.manifest);
    }

    return { hasChanges, changes };
  }

  checkGitUpdates() {
    const updates = [];
    
    for (const { basePath, namespace } of this.skillDirs) {
      if (!fs.existsSync(basePath)) continue;
      
      const gitDir = path.join(basePath, '.git');
      if (!fs.existsSync(gitDir)) {
        const parentGit = path.join(path.dirname(basePath), '.git');
        if (!fs.existsSync(parentGit)) continue;
      }
      
      try {
        const output = execSync('git fetch origin 2>/dev/null && git status --porcelain=v1 --branch 2>/dev/null', {
          cwd: basePath,
          timeout: 5000,
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        if (output.includes('[behind ')) {
          const match = output.match(/\[behind (\d+)\]/);
          const behindCount = match ? parseInt(match[1]) : 1;
          updates.push({
            namespace,
            path: basePath,
            behindCount,
            message: `${namespace || 'personal'} skills: ${behindCount} update(s) available. Run: cd ${basePath} && git pull`
          });
        }
      } catch {}
    }
    
    return updates;
  }

  startFileWatch() {
    if (!this.options.enableFileWatch) return;
    
    for (const { basePath } of this.skillDirs) {
      if (!fs.existsSync(basePath)) continue;
      
      try {
        const watcher = fs.watch(basePath, { recursive: true }, (eventType, filename) => {
          if (!filename) return;
          if (!filename.endsWith('SKILL.md') && !filename.endsWith('.md')) return;
          
          this.debouncedCheck();
        });
        
        this.watchers.push(watcher);
      } catch (err) {
        this.emit('error', { type: 'watch', path: basePath, error: err.message });
      }
    }
  }

  debouncedCheck() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    this.debounceTimer = setTimeout(() => {
      const { hasChanges, changes } = this.detectChanges();
      if (hasChanges) {
        this.emit('change', changes);
      }
    }, this.options.debounceMs);
  }

  startPolling() {
    if (this.pollTimer) return;
    
    const poll = () => {
      const { hasChanges, changes } = this.detectChanges();
      if (hasChanges) {
        this.emit('change', changes);
      }
      
      if (this.options.enableGitCheck) {
        const gitUpdates = this.checkGitUpdates();
        if (gitUpdates.length > 0) {
          this.emit('git-updates', gitUpdates);
        }
      }
    };

    poll();
    this.pollTimer = setInterval(poll, this.options.pollInterval);
  }

  start() {
    this.manifest = this.loadManifest();
    
    const initial = this.detectChanges();
    if (initial.hasChanges) {
      this.emit('change', initial.changes);
    }
    
    this.startFileWatch();
    this.startPolling();
    
    this.emit('started', {
      skillDirs: this.skillDirs.map(d => d.basePath),
      options: this.options
    });
  }

  stop() {
    for (const watcher of this.watchers) {
      watcher.close();
    }
    this.watchers = [];
    
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    
    this.emit('stopped');
  }

  forceRefresh() {
    this.manifest = { version: 1, skills: {}, lastCheck: null };
    return this.detectChanges();
  }
}

function createWatcher(skillDirs, options = {}) {
  return new SkillWatcher(skillDirs, options);
}

export { SkillWatcher, createWatcher };
