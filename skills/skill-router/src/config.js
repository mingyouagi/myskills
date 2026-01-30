import fs from 'fs';
import path from 'path';
import os from 'os';

const homeDir = os.homedir();

// Preset configurations for different AI tools
const PRESETS = {
  'claude-code': {
    skillDirs: [
      { path: path.join(homeDir, '.claude/skills'), namespace: null }
    ],
    pluginCacheDirs: [
      { path: path.join(homeDir, '.claude/plugins/cache/claude-plugins-official'), pattern: '*/skills' }
    ]
  },
  'codex': {
    skillDirs: [
      { path: path.join(homeDir, '.codex/skills'), namespace: null }
    ],
    pluginCacheDirs: [
      { path: path.join(homeDir, '.codex/plugins'), pattern: '*/skills' }
    ]
  },
  'opencode': {
    skillDirs: [
      { path: path.join(homeDir, '.opencode/skills'), namespace: null }
    ],
    pluginCacheDirs: [
      { path: path.join(homeDir, '.opencode/plugins'), pattern: '*/skills' }
    ]
  },
  'all': {
    skillDirs: [
      { path: path.join(homeDir, '.claude/skills'), namespace: null },
      { path: path.join(homeDir, '.codex/skills'), namespace: null },
      { path: path.join(homeDir, '.opencode/skills'), namespace: null }
    ],
    pluginCacheDirs: [
      { path: path.join(homeDir, '.claude/plugins/cache/claude-plugins-official'), pattern: '*/skills' },
      { path: path.join(homeDir, '.codex/plugins'), pattern: '*/skills' },
      { path: path.join(homeDir, '.opencode/plugins'), pattern: '*/skills' }
    ]
  }
};

// Config file locations (in priority order)
const CONFIG_LOCATIONS = [
  './.skill-router.json',                                    // Project config
  path.join(homeDir, '.config/skill-router/config.json'),    // User config
  path.join(homeDir, '.skill-router.json')                   // User home config
];

let cachedConfig = null;

/**
 * Load configuration from file
 */
function loadConfigFile() {
  for (const configPath of CONFIG_LOCATIONS) {
    try {
      const resolvedPath = path.resolve(configPath);
      if (fs.existsSync(resolvedPath)) {
        const content = fs.readFileSync(resolvedPath, 'utf8');
        return { config: JSON.parse(content), path: resolvedPath };
      }
    } catch {
      // Continue to next location
    }
  }
  return null;
}

/**
 * Get merged configuration
 */
export function getConfig() {
  if (cachedConfig) return cachedConfig;

  // Default config
  let config = {
    preset: 'claude-code',
    skillDirs: [],
    pluginCacheDirs: [],
    language: 'en'
  };

  // Load from file
  const fileConfig = loadConfigFile();
  if (fileConfig) {
    config = { ...config, ...fileConfig.config };
  }

  // Apply preset
  const preset = PRESETS[config.preset];
  if (preset) {
    // Preset provides base, custom dirs are added on top
    config.skillDirs = [...preset.skillDirs, ...config.skillDirs];
    config.pluginCacheDirs = [...preset.pluginCacheDirs, ...config.pluginCacheDirs];
  }

  cachedConfig = config;
  return config;
}

/**
 * Get skill directories from config
 */
export function getSkillDirs() {
  const config = getConfig();
  const dirs = [];

  // Add plugin cache directories
  for (const cacheDir of config.pluginCacheDirs) {
    const pluginDirs = scanPluginCache(cacheDir.path, cacheDir.pattern);
    dirs.push(...pluginDirs);
  }

  // Add explicit skill directories
  for (const dir of config.skillDirs) {
    if (fs.existsSync(dir.path)) {
      dirs.push({ basePath: dir.path, namespace: dir.namespace });
    }
  }

  return dirs;
}

/**
 * Scan plugin cache directory for skills
 */
function scanPluginCache(cachePath, pattern = '*/skills') {
  const dirs = [];

  if (!fs.existsSync(cachePath)) return dirs;

  try {
    const plugins = fs.readdirSync(cachePath);

    for (const plugin of plugins) {
      const pluginPath = path.join(cachePath, plugin);
      try {
        const stat = fs.statSync(pluginPath);
        if (!stat.isDirectory()) continue;

        // Find latest version
        const versions = fs.readdirSync(pluginPath)
          .filter(v => /^\d+\.\d+\.\d+$/.test(v))
          .sort((a, b) => {
            const [aMajor, aMinor, aPatch] = a.split('.').map(Number);
            const [bMajor, bMinor, bPatch] = b.split('.').map(Number);
            return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch;
          });

        if (versions.length > 0) {
          const skillsPath = path.join(pluginPath, versions[0], 'skills');
          if (fs.existsSync(skillsPath)) {
            dirs.push({ basePath: skillsPath, namespace: plugin });
          }
        }
      } catch {
        // Skip this plugin
      }
    }
  } catch {
    // Ignore errors
  }

  return dirs;
}

/**
 * Invalidate config cache (for testing or hot reload)
 */
export function invalidateConfigCache() {
  cachedConfig = null;
}

/**
 * Get available presets
 */
export function getPresets() {
  return Object.keys(PRESETS);
}

/**
 * Get preset configuration
 */
export function getPreset(name) {
  return PRESETS[name] || null;
}
