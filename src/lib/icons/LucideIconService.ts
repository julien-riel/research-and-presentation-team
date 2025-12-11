/**
 * LucideIconService - Search and download icons from Lucide Icons
 *
 * Lucide is an open-source icon library with 1500+ icons
 * https://lucide.dev
 *
 * Features:
 * - Search icons by name/keyword
 * - Download as SVG or PNG
 * - Customize color and size
 * - No API key required
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * Icon metadata from Lucide
 */
export interface LucideIcon {
  name: string;
  tags: string[];
  categories: string[];
}

/**
 * Icon download options
 */
export interface IconOptions {
  /** Icon color (hex without #) */
  color?: string;
  /** Icon size in pixels */
  size?: number;
  /** Stroke width (1-3) */
  strokeWidth?: number;
}

/**
 * Downloaded icon result
 */
export interface DownloadedIcon {
  name: string;
  path: string;
  format: 'svg' | 'png';
  size: number;
  color: string;
}

/**
 * Lucide icon catalog (commonly used icons with tags)
 * Full catalog at: https://lucide.dev/icons
 */
const ICON_CATALOG: LucideIcon[] = [
  // Business & Finance
  { name: 'briefcase', tags: ['business', 'work', 'job', 'career'], categories: ['business'] },
  { name: 'building', tags: ['company', 'office', 'enterprise', 'corporate'], categories: ['business'] },
  { name: 'building-2', tags: ['company', 'office', 'skyscraper'], categories: ['business'] },
  { name: 'landmark', tags: ['bank', 'finance', 'government', 'institution'], categories: ['business', 'finance'] },
  { name: 'wallet', tags: ['money', 'payment', 'finance'], categories: ['finance'] },
  { name: 'credit-card', tags: ['payment', 'money', 'bank'], categories: ['finance'] },
  { name: 'banknote', tags: ['money', 'cash', 'payment', 'currency'], categories: ['finance'] },
  { name: 'coins', tags: ['money', 'currency', 'finance'], categories: ['finance'] },
  { name: 'piggy-bank', tags: ['savings', 'money', 'finance'], categories: ['finance'] },
  { name: 'receipt', tags: ['invoice', 'bill', 'payment'], categories: ['finance'] },
  { name: 'calculator', tags: ['math', 'finance', 'calculate'], categories: ['finance'] },

  // Charts & Data
  { name: 'bar-chart', tags: ['chart', 'graph', 'analytics', 'data', 'statistics'], categories: ['charts'] },
  { name: 'bar-chart-2', tags: ['chart', 'graph', 'analytics', 'data'], categories: ['charts'] },
  { name: 'bar-chart-3', tags: ['chart', 'graph', 'horizontal'], categories: ['charts'] },
  { name: 'bar-chart-4', tags: ['chart', 'graph', 'horizontal'], categories: ['charts'] },
  { name: 'line-chart', tags: ['chart', 'graph', 'trend', 'analytics'], categories: ['charts'] },
  { name: 'pie-chart', tags: ['chart', 'graph', 'distribution', 'analytics'], categories: ['charts'] },
  { name: 'trending-up', tags: ['growth', 'increase', 'chart', 'positive'], categories: ['charts', 'arrows'] },
  { name: 'trending-down', tags: ['decline', 'decrease', 'chart', 'negative'], categories: ['charts', 'arrows'] },
  { name: 'activity', tags: ['pulse', 'health', 'monitor', 'chart'], categories: ['charts', 'health'] },

  // People & Users
  { name: 'user', tags: ['person', 'account', 'profile'], categories: ['people'] },
  { name: 'users', tags: ['people', 'team', 'group', 'community'], categories: ['people'] },
  { name: 'user-plus', tags: ['add user', 'new member', 'invite'], categories: ['people'] },
  { name: 'user-check', tags: ['verified', 'approved', 'confirmed'], categories: ['people'] },
  { name: 'user-x', tags: ['remove', 'delete', 'block'], categories: ['people'] },
  { name: 'contact', tags: ['person', 'profile', 'card'], categories: ['people'] },

  // Communication
  { name: 'mail', tags: ['email', 'message', 'envelope', 'letter'], categories: ['communication'] },
  { name: 'message-circle', tags: ['chat', 'comment', 'bubble'], categories: ['communication'] },
  { name: 'message-square', tags: ['chat', 'comment', 'bubble'], categories: ['communication'] },
  { name: 'phone', tags: ['call', 'telephone', 'contact'], categories: ['communication'] },
  { name: 'video', tags: ['camera', 'recording', 'meeting'], categories: ['communication', 'media'] },
  { name: 'send', tags: ['submit', 'share', 'message'], categories: ['communication'] },
  { name: 'share', tags: ['social', 'distribute', 'send'], categories: ['communication'] },
  { name: 'share-2', tags: ['network', 'social', 'connect'], categories: ['communication'] },

  // Technology
  { name: 'laptop', tags: ['computer', 'device', 'macbook'], categories: ['technology'] },
  { name: 'monitor', tags: ['screen', 'display', 'desktop'], categories: ['technology'] },
  { name: 'smartphone', tags: ['phone', 'mobile', 'device'], categories: ['technology'] },
  { name: 'tablet', tags: ['ipad', 'device', 'mobile'], categories: ['technology'] },
  { name: 'server', tags: ['database', 'hosting', 'backend'], categories: ['technology'] },
  { name: 'database', tags: ['storage', 'data', 'server'], categories: ['technology'] },
  { name: 'cloud', tags: ['storage', 'hosting', 'saas'], categories: ['technology'] },
  { name: 'wifi', tags: ['internet', 'network', 'wireless'], categories: ['technology'] },
  { name: 'cpu', tags: ['processor', 'chip', 'hardware'], categories: ['technology'] },
  { name: 'hard-drive', tags: ['storage', 'disk', 'data'], categories: ['technology'] },
  { name: 'code', tags: ['programming', 'developer', 'software'], categories: ['technology'] },
  { name: 'terminal', tags: ['command', 'cli', 'console'], categories: ['technology'] },
  { name: 'git-branch', tags: ['version', 'code', 'repository'], categories: ['technology'] },

  // Navigation & Actions
  { name: 'home', tags: ['house', 'main', 'dashboard'], categories: ['navigation'] },
  { name: 'menu', tags: ['hamburger', 'navigation', 'list'], categories: ['navigation'] },
  { name: 'search', tags: ['find', 'magnifier', 'lookup'], categories: ['navigation'] },
  { name: 'settings', tags: ['gear', 'config', 'preferences'], categories: ['navigation'] },
  { name: 'sliders', tags: ['controls', 'adjust', 'settings'], categories: ['navigation'] },
  { name: 'filter', tags: ['sort', 'funnel', 'refine'], categories: ['navigation'] },
  { name: 'plus', tags: ['add', 'new', 'create'], categories: ['actions'] },
  { name: 'minus', tags: ['remove', 'subtract', 'delete'], categories: ['actions'] },
  { name: 'x', tags: ['close', 'cancel', 'remove'], categories: ['actions'] },
  { name: 'check', tags: ['done', 'complete', 'success', 'yes'], categories: ['actions'] },
  { name: 'check-circle', tags: ['done', 'complete', 'success'], categories: ['actions'] },
  { name: 'x-circle', tags: ['error', 'cancel', 'failed'], categories: ['actions'] },
  { name: 'edit', tags: ['pencil', 'modify', 'write'], categories: ['actions'] },
  { name: 'trash', tags: ['delete', 'remove', 'bin'], categories: ['actions'] },
  { name: 'copy', tags: ['duplicate', 'clone'], categories: ['actions'] },
  { name: 'download', tags: ['save', 'export', 'get'], categories: ['actions'] },
  { name: 'upload', tags: ['import', 'send', 'share'], categories: ['actions'] },
  { name: 'refresh-cw', tags: ['reload', 'sync', 'update'], categories: ['actions'] },
  { name: 'rotate-cw', tags: ['rotate', 'turn', 'clockwise'], categories: ['actions'] },
  { name: 'undo', tags: ['back', 'revert', 'previous'], categories: ['actions'] },
  { name: 'redo', tags: ['forward', 'repeat'], categories: ['actions'] },

  // Arrows
  { name: 'arrow-up', tags: ['up', 'direction', 'top'], categories: ['arrows'] },
  { name: 'arrow-down', tags: ['down', 'direction', 'bottom'], categories: ['arrows'] },
  { name: 'arrow-left', tags: ['left', 'direction', 'back'], categories: ['arrows'] },
  { name: 'arrow-right', tags: ['right', 'direction', 'forward', 'next'], categories: ['arrows'] },
  { name: 'chevron-up', tags: ['up', 'expand', 'collapse'], categories: ['arrows'] },
  { name: 'chevron-down', tags: ['down', 'expand', 'dropdown'], categories: ['arrows'] },
  { name: 'chevron-left', tags: ['left', 'previous', 'back'], categories: ['arrows'] },
  { name: 'chevron-right', tags: ['right', 'next', 'forward'], categories: ['arrows'] },
  { name: 'chevrons-up', tags: ['up', 'top', 'first'], categories: ['arrows'] },
  { name: 'chevrons-down', tags: ['down', 'bottom', 'last'], categories: ['arrows'] },
  { name: 'move', tags: ['drag', 'reorder', 'arrange'], categories: ['arrows'] },
  { name: 'external-link', tags: ['open', 'new tab', 'link'], categories: ['arrows'] },

  // Status & Alerts
  { name: 'alert-circle', tags: ['warning', 'error', 'attention'], categories: ['status'] },
  { name: 'alert-triangle', tags: ['warning', 'caution', 'danger'], categories: ['status'] },
  { name: 'info', tags: ['information', 'help', 'details'], categories: ['status'] },
  { name: 'help-circle', tags: ['question', 'support', 'faq'], categories: ['status'] },
  { name: 'bell', tags: ['notification', 'alert', 'alarm'], categories: ['status'] },
  { name: 'bell-off', tags: ['mute', 'silent', 'disable'], categories: ['status'] },
  { name: 'zap', tags: ['lightning', 'fast', 'power', 'energy'], categories: ['status'] },
  { name: 'zap-off', tags: ['disable', 'slow'], categories: ['status'] },

  // Files & Documents
  { name: 'file', tags: ['document', 'page'], categories: ['files'] },
  { name: 'file-text', tags: ['document', 'page', 'text'], categories: ['files'] },
  { name: 'file-plus', tags: ['new', 'add', 'create'], categories: ['files'] },
  { name: 'files', tags: ['documents', 'multiple', 'stack'], categories: ['files'] },
  { name: 'folder', tags: ['directory', 'container'], categories: ['files'] },
  { name: 'folder-open', tags: ['directory', 'open'], categories: ['files'] },
  { name: 'folder-plus', tags: ['new folder', 'create'], categories: ['files'] },
  { name: 'archive', tags: ['zip', 'compress', 'storage'], categories: ['files'] },
  { name: 'clipboard', tags: ['paste', 'copy', 'notes'], categories: ['files'] },
  { name: 'clipboard-list', tags: ['tasks', 'checklist', 'todo'], categories: ['files'] },
  { name: 'book', tags: ['read', 'documentation', 'manual'], categories: ['files'] },
  { name: 'book-open', tags: ['read', 'learn', 'education'], categories: ['files'] },
  { name: 'bookmark', tags: ['save', 'favorite', 'mark'], categories: ['files'] },

  // Media
  { name: 'image', tags: ['photo', 'picture', 'gallery'], categories: ['media'] },
  { name: 'camera', tags: ['photo', 'picture', 'capture'], categories: ['media'] },
  { name: 'film', tags: ['movie', 'video', 'cinema'], categories: ['media'] },
  { name: 'music', tags: ['audio', 'sound', 'song'], categories: ['media'] },
  { name: 'headphones', tags: ['audio', 'music', 'listen'], categories: ['media'] },
  { name: 'mic', tags: ['microphone', 'audio', 'record'], categories: ['media'] },
  { name: 'volume-2', tags: ['sound', 'audio', 'speaker'], categories: ['media'] },
  { name: 'play', tags: ['start', 'video', 'audio'], categories: ['media'] },
  { name: 'pause', tags: ['stop', 'hold', 'wait'], categories: ['media'] },

  // Time & Calendar
  { name: 'clock', tags: ['time', 'watch', 'hour'], categories: ['time'] },
  { name: 'calendar', tags: ['date', 'schedule', 'event'], categories: ['time'] },
  { name: 'calendar-days', tags: ['date', 'schedule', 'month'], categories: ['time'] },
  { name: 'timer', tags: ['countdown', 'stopwatch'], categories: ['time'] },
  { name: 'hourglass', tags: ['time', 'wait', 'loading'], categories: ['time'] },
  { name: 'history', tags: ['time', 'past', 'undo'], categories: ['time'] },

  // Security
  { name: 'lock', tags: ['security', 'password', 'private'], categories: ['security'] },
  { name: 'unlock', tags: ['open', 'access', 'public'], categories: ['security'] },
  { name: 'shield', tags: ['security', 'protection', 'safe'], categories: ['security'] },
  { name: 'shield-check', tags: ['verified', 'secure', 'protected'], categories: ['security'] },
  { name: 'key', tags: ['password', 'access', 'unlock'], categories: ['security'] },
  { name: 'eye', tags: ['view', 'visible', 'show'], categories: ['security'] },
  { name: 'eye-off', tags: ['hide', 'invisible', 'private'], categories: ['security'] },

  // Location
  { name: 'map', tags: ['location', 'geography', 'navigation'], categories: ['location'] },
  { name: 'map-pin', tags: ['location', 'marker', 'place'], categories: ['location'] },
  { name: 'navigation', tags: ['direction', 'compass', 'gps'], categories: ['location'] },
  { name: 'compass', tags: ['direction', 'navigation', 'north'], categories: ['location'] },
  { name: 'globe', tags: ['world', 'earth', 'international'], categories: ['location'] },
  { name: 'globe-2', tags: ['world', 'earth', 'web'], categories: ['location'] },

  // Nature & Weather
  { name: 'sun', tags: ['light', 'day', 'weather', 'bright'], categories: ['weather'] },
  { name: 'moon', tags: ['night', 'dark', 'sleep'], categories: ['weather'] },
  { name: 'cloud', tags: ['weather', 'storage', 'sky'], categories: ['weather'] },
  { name: 'cloud-rain', tags: ['weather', 'rain', 'storm'], categories: ['weather'] },
  { name: 'snowflake', tags: ['winter', 'cold', 'freeze'], categories: ['weather'] },
  { name: 'wind', tags: ['weather', 'air', 'breeze'], categories: ['weather'] },
  { name: 'thermometer', tags: ['temperature', 'heat', 'cold'], categories: ['weather'] },
  { name: 'droplet', tags: ['water', 'rain', 'liquid'], categories: ['weather'] },
  { name: 'flame', tags: ['fire', 'hot', 'burn'], categories: ['weather'] },
  { name: 'leaf', tags: ['nature', 'plant', 'eco', 'green'], categories: ['nature'] },
  { name: 'tree', tags: ['nature', 'forest', 'plant'], categories: ['nature'] },
  { name: 'flower', tags: ['nature', 'plant', 'garden'], categories: ['nature'] },

  // Social
  { name: 'heart', tags: ['love', 'like', 'favorite'], categories: ['social'] },
  { name: 'thumbs-up', tags: ['like', 'approve', 'good'], categories: ['social'] },
  { name: 'thumbs-down', tags: ['dislike', 'bad', 'reject'], categories: ['social'] },
  { name: 'star', tags: ['favorite', 'rate', 'bookmark'], categories: ['social'] },
  { name: 'award', tags: ['trophy', 'prize', 'achievement'], categories: ['social'] },
  { name: 'trophy', tags: ['award', 'winner', 'prize'], categories: ['social'] },
  { name: 'gift', tags: ['present', 'reward', 'bonus'], categories: ['social'] },
  { name: 'smile', tags: ['happy', 'emoji', 'positive'], categories: ['social'] },
  { name: 'frown', tags: ['sad', 'emoji', 'negative'], categories: ['social'] },

  // Shopping
  { name: 'shopping-cart', tags: ['cart', 'buy', 'ecommerce'], categories: ['shopping'] },
  { name: 'shopping-bag', tags: ['bag', 'buy', 'store'], categories: ['shopping'] },
  { name: 'tag', tags: ['label', 'price', 'sale'], categories: ['shopping'] },
  { name: 'tags', tags: ['labels', 'categories', 'multiple'], categories: ['shopping'] },
  { name: 'percent', tags: ['discount', 'sale', 'off'], categories: ['shopping'] },
  { name: 'package', tags: ['box', 'shipping', 'delivery'], categories: ['shopping'] },
  { name: 'truck', tags: ['delivery', 'shipping', 'transport'], categories: ['shopping'] },

  // Misc
  { name: 'lightbulb', tags: ['idea', 'innovation', 'creative'], categories: ['misc'] },
  { name: 'target', tags: ['goal', 'aim', 'focus'], categories: ['misc'] },
  { name: 'flag', tags: ['report', 'mark', 'milestone'], categories: ['misc'] },
  { name: 'layers', tags: ['stack', 'levels', 'design'], categories: ['misc'] },
  { name: 'layout', tags: ['grid', 'design', 'template'], categories: ['misc'] },
  { name: 'grid', tags: ['layout', 'table', 'matrix'], categories: ['misc'] },
  { name: 'list', tags: ['menu', 'items', 'bullet'], categories: ['misc'] },
  { name: 'puzzle', tags: ['piece', 'solution', 'integration'], categories: ['misc'] },
  { name: 'box', tags: ['container', 'package', 'cube'], categories: ['misc'] },
  { name: 'circle', tags: ['shape', 'round', 'dot'], categories: ['misc'] },
  { name: 'square', tags: ['shape', 'box', 'rectangle'], categories: ['misc'] },
  { name: 'triangle', tags: ['shape', 'warning', 'arrow'], categories: ['misc'] },
  { name: 'hexagon', tags: ['shape', 'polygon', 'honey'], categories: ['misc'] },
  { name: 'hash', tags: ['number', 'hashtag', 'tag'], categories: ['misc'] },
  { name: 'at-sign', tags: ['email', 'mention', 'address'], categories: ['misc'] },
  { name: 'link', tags: ['url', 'chain', 'connect'], categories: ['misc'] },
  { name: 'link-2', tags: ['url', 'connect', 'attach'], categories: ['misc'] },
  { name: 'paperclip', tags: ['attach', 'file', 'clip'], categories: ['misc'] },
  { name: 'scissors', tags: ['cut', 'trim', 'clip'], categories: ['misc'] },
  { name: 'type', tags: ['text', 'font', 'typography'], categories: ['misc'] },
  { name: 'bold', tags: ['text', 'format', 'strong'], categories: ['misc'] },
  { name: 'italic', tags: ['text', 'format', 'emphasis'], categories: ['misc'] },
  { name: 'underline', tags: ['text', 'format', 'decoration'], categories: ['misc'] },
  { name: 'align-left', tags: ['text', 'format', 'paragraph'], categories: ['misc'] },
  { name: 'align-center', tags: ['text', 'format', 'paragraph'], categories: ['misc'] },
  { name: 'align-right', tags: ['text', 'format', 'paragraph'], categories: ['misc'] },
  { name: 'maximize', tags: ['fullscreen', 'expand', 'enlarge'], categories: ['misc'] },
  { name: 'minimize', tags: ['reduce', 'shrink', 'collapse'], categories: ['misc'] },
  { name: 'zoom-in', tags: ['magnify', 'enlarge', 'plus'], categories: ['misc'] },
  { name: 'zoom-out', tags: ['reduce', 'shrink', 'minus'], categories: ['misc'] },
  { name: 'move', tags: ['drag', 'reposition', 'arrange'], categories: ['misc'] },
  { name: 'grip-vertical', tags: ['drag', 'handle', 'reorder'], categories: ['misc'] },
  { name: 'more-horizontal', tags: ['menu', 'options', 'dots'], categories: ['misc'] },
  { name: 'more-vertical', tags: ['menu', 'options', 'dots'], categories: ['misc'] },
];

/**
 * Base URL for Lucide icons
 */
const LUCIDE_CDN = 'https://unpkg.com/lucide-static@latest/icons';

/**
 * Lucide Icon Service
 */
export class LucideIconService {
  private catalog: LucideIcon[] = ICON_CATALOG;

  /**
   * Search icons by keyword
   */
  search(query: string, limit = 20): LucideIcon[] {
    const q = query.toLowerCase().trim();

    if (!q) {
      return this.catalog.slice(0, limit);
    }

    // Score and sort by relevance
    const scored = this.catalog.map(icon => {
      let score = 0;

      // Exact name match
      if (icon.name === q) score += 100;
      // Name starts with query
      else if (icon.name.startsWith(q)) score += 50;
      // Name contains query
      else if (icon.name.includes(q)) score += 25;

      // Tag matches
      for (const tag of icon.tags) {
        if (tag === q) score += 40;
        else if (tag.startsWith(q)) score += 20;
        else if (tag.includes(q)) score += 10;
      }

      // Category matches
      for (const cat of icon.categories) {
        if (cat === q) score += 30;
        else if (cat.includes(q)) score += 15;
      }

      return { icon, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.icon);
  }

  /**
   * List icons by category
   */
  listByCategory(category: string): LucideIcon[] {
    const cat = category.toLowerCase();
    return this.catalog.filter(icon =>
      icon.categories.some(c => c.toLowerCase() === cat)
    );
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    for (const icon of this.catalog) {
      for (const cat of icon.categories) {
        categories.add(cat);
      }
    }
    return Array.from(categories).sort();
  }

  /**
   * Get icon SVG content
   */
  async getSvg(name: string, options: IconOptions = {}): Promise<string> {
    const { color = '000000', size = 24, strokeWidth = 2 } = options;

    const url = `${LUCIDE_CDN}/${name}.svg`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Icon not found: ${name}`);
    }

    let svg = await response.text();

    // Apply customizations
    svg = svg.replace(/stroke="[^"]*"/, `stroke="#${color}"`);
    svg = svg.replace(/stroke-width="[^"]*"/, `stroke-width="${strokeWidth}"`);
    svg = svg.replace(/width="[^"]*"/, `width="${size}"`);
    svg = svg.replace(/height="[^"]*"/, `height="${size}"`);

    return svg;
  }

  /**
   * Download icon to file
   */
  async download(
    name: string,
    outputPath: string,
    options: IconOptions = {}
  ): Promise<DownloadedIcon> {
    const { size = 24, color = '000000' } = options;

    // Ensure output directory exists
    const dir = dirname(outputPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const svg = await this.getSvg(name, options);
    writeFileSync(outputPath, svg);

    return {
      name,
      path: outputPath,
      format: 'svg',
      size,
      color,
    };
  }

  /**
   * Download multiple icons
   */
  async downloadBatch(
    names: string[],
    outputDir: string,
    options: IconOptions = {}
  ): Promise<DownloadedIcon[]> {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const results: DownloadedIcon[] = [];

    for (const name of names) {
      try {
        const outputPath = join(outputDir, `${name}.svg`);
        const result = await this.download(name, outputPath, options);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to download icon: ${name}`);
      }
    }

    return results;
  }

  /**
   * Get icon by exact name
   */
  getByName(name: string): LucideIcon | undefined {
    return this.catalog.find(icon => icon.name === name);
  }

  /**
   * Check if icon exists
   */
  exists(name: string): boolean {
    return this.catalog.some(icon => icon.name === name);
  }

  /**
   * Get catalog size
   */
  get size(): number {
    return this.catalog.length;
  }
}

/**
 * Singleton instance
 */
let instance: LucideIconService | null = null;

/**
 * Get singleton instance
 */
export function getLucideIconService(): LucideIconService {
  if (!instance) {
    instance = new LucideIconService();
  }
  return instance;
}
