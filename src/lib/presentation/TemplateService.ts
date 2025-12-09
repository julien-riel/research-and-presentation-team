/**
 * TemplateService - Predefined presentation templates and themes
 *
 * Features:
 * - Multiple professional presentation templates
 * - Predefined color themes (corporate, modern, minimal, etc.)
 * - Master slide definitions
 * - Quick-start templates for common use cases
 */

import type {
  PresentationSpec,
  PresentationTheme,
  MasterSlide,
  SlideSpec,
  ThemeColors,
} from '../../types/presentation.js';

/**
 * Predefined color themes
 */
export const THEMES = {
  corporate: {
    colors: {
      primary: '#1E3A5F',
      secondary: '#4A6FA5',
      accent: '#EE6C4D',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: { primary: '#333333', secondary: '#666666' },
    },
    typography: {
      fontFamily: { heading: 'Arial', body: 'Arial' },
      sizes: { h1: '44', h2: '32', h3: '24', body: '18', caption: '14' },
    },
  } as PresentationTheme,

  modern: {
    colors: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F9FAFB',
      text: { primary: '#111827', secondary: '#6B7280' },
    },
    typography: {
      fontFamily: { heading: 'Segoe UI', body: 'Segoe UI' },
      sizes: { h1: '48', h2: '36', h3: '24', body: '18', caption: '14' },
    },
  } as PresentationTheme,

  minimal: {
    colors: {
      primary: '#18181B',
      secondary: '#3F3F46',
      accent: '#F97316',
      background: '#FFFFFF',
      surface: '#FAFAFA',
      text: { primary: '#18181B', secondary: '#71717A' },
    },
    typography: {
      fontFamily: { heading: 'Helvetica', body: 'Helvetica' },
      sizes: { h1: '44', h2: '32', h3: '22', body: '16', caption: '12' },
    },
  } as PresentationTheme,

  nature: {
    colors: {
      primary: '#065F46',
      secondary: '#047857',
      accent: '#FBBF24',
      background: '#FFFFFF',
      surface: '#ECFDF5',
      text: { primary: '#064E3B', secondary: '#047857' },
    },
    typography: {
      fontFamily: { heading: 'Georgia', body: 'Arial' },
      sizes: { h1: '44', h2: '32', h3: '24', body: '18', caption: '14' },
    },
  } as PresentationTheme,

  tech: {
    colors: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#22D3EE',
      background: '#F8FAFC',
      surface: '#E2E8F0',
      text: { primary: '#0F172A', secondary: '#475569' },
    },
    typography: {
      fontFamily: { heading: 'Consolas', body: 'Segoe UI' },
      sizes: { h1: '44', h2: '32', h3: '24', body: '18', caption: '14' },
    },
  } as PresentationTheme,

  warmth: {
    colors: {
      primary: '#7C2D12',
      secondary: '#9A3412',
      accent: '#FBBF24',
      background: '#FFFBEB',
      surface: '#FEF3C7',
      text: { primary: '#451A03', secondary: '#78350F' },
    },
    typography: {
      fontFamily: { heading: 'Palatino Linotype', body: 'Georgia' },
      sizes: { h1: '44', h2: '32', h3: '24', body: '18', caption: '14' },
    },
  } as PresentationTheme,

  ocean: {
    colors: {
      primary: '#0C4A6E',
      secondary: '#0369A1',
      accent: '#F97316',
      background: '#F0F9FF',
      surface: '#E0F2FE',
      text: { primary: '#0C4A6E', secondary: '#0284C7' },
    },
    typography: {
      fontFamily: { heading: 'Trebuchet MS', body: 'Calibri' },
      sizes: { h1: '44', h2: '32', h3: '24', body: '18', caption: '14' },
    },
  } as PresentationTheme,

  dark: {
    colors: {
      primary: '#1F2937',
      secondary: '#374151',
      accent: '#10B981',
      background: '#111827',
      surface: '#1F2937',
      text: { primary: '#F9FAFB', secondary: '#D1D5DB' },
    },
    typography: {
      fontFamily: { heading: 'Arial', body: 'Arial' },
      sizes: { h1: '44', h2: '32', h3: '24', body: '18', caption: '14' },
    },
  } as PresentationTheme,
} as const;

/**
 * Theme names type
 */
export type ThemeName = keyof typeof THEMES;

/**
 * Predefined master slides
 */
export const MASTER_SLIDES = {
  titleMaster: {
    name: 'TITLE_MASTER',
    background: { color: '#1E3A5F' },
  } as MasterSlide,

  sectionMaster: {
    name: 'SECTION_MASTER',
    background: { color: '#4A6FA5' },
  } as MasterSlide,

  contentMaster: {
    name: 'CONTENT_MASTER',
    background: { color: '#FFFFFF' },
    elements: [
      {
        type: 'shape' as const,
        shape: 'rect',
        position: { x: 0, y: 0, w: 10, h: 0.8 },
        style: { fill: '#1E3A5F' },
      },
    ],
  } as MasterSlide,

  blankMaster: {
    name: 'BLANK_MASTER',
    background: { color: '#FFFFFF' },
  } as MasterSlide,
};

/**
 * Template types
 */
export type TemplateType =
  | 'business-report'
  | 'pitch-deck'
  | 'training'
  | 'quarterly-review'
  | 'product-launch'
  | 'data-analysis';

/**
 * Template configuration
 */
export interface TemplateConfig {
  title: string;
  subtitle?: string;
  author?: string;
  company?: string;
  date?: string;
  theme?: ThemeName | PresentationTheme;
  sections?: string[];
  customData?: Record<string, unknown>;
}

/**
 * Service for creating presentations from templates
 */
export class TemplateService {
  /**
   * Get available themes
   */
  getAvailableThemes(): ThemeName[] {
    return Object.keys(THEMES) as ThemeName[];
  }

  /**
   * Get a theme by name
   */
  getTheme(name: ThemeName): PresentationTheme {
    return THEMES[name];
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): TemplateType[] {
    return [
      'business-report',
      'pitch-deck',
      'training',
      'quarterly-review',
      'product-launch',
      'data-analysis',
    ];
  }

  /**
   * Create presentation from template
   */
  createFromTemplate(
    templateType: TemplateType,
    config: TemplateConfig
  ): PresentationSpec {
    const theme = typeof config.theme === 'string'
      ? THEMES[config.theme]
      : config.theme || THEMES.corporate;

    switch (templateType) {
      case 'business-report':
        return this.createBusinessReport(config, theme);
      case 'pitch-deck':
        return this.createPitchDeck(config, theme);
      case 'training':
        return this.createTraining(config, theme);
      case 'quarterly-review':
        return this.createQuarterlyReview(config, theme);
      case 'product-launch':
        return this.createProductLaunch(config, theme);
      case 'data-analysis':
        return this.createDataAnalysis(config, theme);
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }
  }

  /**
   * Create custom theme from colors
   */
  createCustomTheme(
    colors: Partial<ThemeColors>,
    fontFamily?: { heading?: string; body?: string }
  ): PresentationTheme {
    return {
      colors: {
        ...THEMES.corporate.colors,
        ...colors,
        text: {
          ...THEMES.corporate.colors.text,
          ...(colors.text || {}),
        },
      },
      typography: {
        fontFamily: {
          heading: fontFamily?.heading || 'Arial',
          body: fontFamily?.body || 'Arial',
        },
        sizes: THEMES.corporate.typography.sizes,
      },
    };
  }

  /**
   * Business Report template
   */
  private createBusinessReport(
    config: TemplateConfig,
    theme: PresentationTheme
  ): PresentationSpec {
    const sections = config.sections || [
      'Executive Summary',
      'Key Metrics',
      'Analysis',
      'Recommendations',
      'Next Steps',
    ];

    const slides: SlideSpec[] = [
      // Title slide
      {
        type: 'title',
        title: config.title,
        subtitle: config.subtitle || 'Business Report',
        author: config.author,
        date: config.date || new Date().toISOString().split('T')[0],
      },
      // Agenda
      {
        type: 'content',
        title: 'Agenda',
        elements: [
          {
            type: 'bullets',
            items: sections.map((s, i) => `${i + 1}. ${s}`),
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Section slides
      ...sections.map((section, index) => ({
        type: 'section' as const,
        number: index + 1,
        title: section,
        subtitle: 'Click to add content',
      })),
      // Thank you slide
      {
        type: 'title',
        title: 'Thank You',
        subtitle: 'Questions?',
        author: config.author,
      },
    ];

    return {
      metadata: {
        title: config.title,
        author: config.author,
        company: config.company,
        subject: 'Business Report',
      },
      settings: { layout: 'LAYOUT_16x9' },
      theme,
      slides,
    };
  }

  /**
   * Pitch Deck template
   */
  private createPitchDeck(
    config: TemplateConfig,
    theme: PresentationTheme
  ): PresentationSpec {
    const slides: SlideSpec[] = [
      // Title
      {
        type: 'title',
        title: config.title,
        subtitle: config.subtitle || 'Investor Presentation',
        author: config.company,
        date: config.date,
      },
      // Problem
      {
        type: 'section',
        number: 1,
        title: 'The Problem',
        subtitle: 'What challenge are we solving?',
      },
      {
        type: 'content',
        title: 'Problem Statement',
        elements: [
          {
            type: 'text',
            content: 'Add your problem description here...',
            position: { x: 0.5, y: 1.5, w: 9, h: 3.5 },
            style: { fontSize: 24 },
          },
        ],
      },
      // Solution
      {
        type: 'section',
        number: 2,
        title: 'Our Solution',
        subtitle: 'How we solve it',
      },
      {
        type: 'content',
        title: 'Solution Overview',
        elements: [
          {
            type: 'bullets',
            items: [
              'Key benefit #1',
              'Key benefit #2',
              'Key benefit #3',
            ],
            position: { x: 0.5, y: 1.5, w: 9, h: 3 },
          },
        ],
      },
      // Market
      {
        type: 'section',
        number: 3,
        title: 'Market Opportunity',
        subtitle: 'Size and growth',
      },
      {
        type: 'content',
        title: 'Market Size',
        elements: [
          {
            type: 'text',
            content: 'TAM: $XX Billion\nSAM: $XX Billion\nSOM: $XX Million',
            position: { x: 0.5, y: 1.5, w: 9, h: 3 },
            style: { fontSize: 28, align: 'center' },
          },
        ],
      },
      // Business Model
      {
        type: 'section',
        number: 4,
        title: 'Business Model',
        subtitle: 'How we make money',
      },
      // Traction
      {
        type: 'section',
        number: 5,
        title: 'Traction',
        subtitle: 'Key metrics and milestones',
      },
      // Team
      {
        type: 'section',
        number: 6,
        title: 'Team',
        subtitle: 'Who we are',
      },
      // The Ask
      {
        type: 'content',
        title: 'The Ask',
        elements: [
          {
            type: 'text',
            content: 'We are raising $X to achieve Y',
            position: { x: 0.5, y: 2, w: 9, h: 2 },
            style: { fontSize: 32, bold: true, align: 'center' },
          },
        ],
      },
      // Contact
      {
        type: 'title',
        title: 'Let\'s Talk',
        subtitle: config.author || 'Contact us',
        author: config.company,
      },
    ];

    return {
      metadata: {
        title: config.title,
        author: config.author,
        company: config.company,
        subject: 'Pitch Deck',
      },
      settings: { layout: 'LAYOUT_16x9' },
      theme,
      slides,
    };
  }

  /**
   * Training template
   */
  private createTraining(
    config: TemplateConfig,
    theme: PresentationTheme
  ): PresentationSpec {
    const modules = config.sections || [
      'Introduction',
      'Module 1: Fundamentals',
      'Module 2: Advanced Topics',
      'Module 3: Best Practices',
      'Summary & Quiz',
    ];

    const slides: SlideSpec[] = [
      // Title
      {
        type: 'title',
        title: config.title,
        subtitle: config.subtitle || 'Training Program',
        author: config.author,
        date: config.date,
      },
      // Learning Objectives
      {
        type: 'content',
        title: 'Learning Objectives',
        elements: [
          {
            type: 'bullets',
            items: [
              'Understand the fundamentals',
              'Apply concepts in practice',
              'Identify best practices',
              'Solve real-world problems',
            ],
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Agenda
      {
        type: 'content',
        title: 'Course Outline',
        elements: [
          {
            type: 'bullets',
            items: modules,
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Module section slides
      ...modules.flatMap((module, index) => [
        {
          type: 'section' as const,
          number: index + 1,
          title: module,
        },
        {
          type: 'content' as const,
          title: `${module} - Content`,
          elements: [
            {
              type: 'bullets' as const,
              items: ['Key point 1', 'Key point 2', 'Key point 3'],
              position: { x: 0.5, y: 1.3, w: 9, h: 4 },
            },
          ],
        },
      ]),
      // Summary
      {
        type: 'content',
        title: 'Key Takeaways',
        elements: [
          {
            type: 'bullets',
            items: [
              'Summary point 1',
              'Summary point 2',
              'Summary point 3',
            ],
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Questions
      {
        type: 'title',
        title: 'Questions?',
        subtitle: 'Thank you for attending!',
        author: config.author,
      },
    ];

    return {
      metadata: {
        title: config.title,
        author: config.author,
        company: config.company,
        subject: 'Training',
      },
      settings: { layout: 'LAYOUT_16x9' },
      theme,
      slides,
    };
  }

  /**
   * Quarterly Review template
   */
  private createQuarterlyReview(
    config: TemplateConfig,
    theme: PresentationTheme
  ): PresentationSpec {
    const slides: SlideSpec[] = [
      // Title
      {
        type: 'title',
        title: config.title || 'Quarterly Business Review',
        subtitle: config.subtitle || `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
        author: config.author,
        date: config.date,
      },
      // Executive Summary
      {
        type: 'section',
        number: 1,
        title: 'Executive Summary',
        subtitle: 'Key highlights',
      },
      {
        type: 'content',
        title: 'Quarter at a Glance',
        elements: [
          {
            type: 'table',
            headers: ['Metric', 'Target', 'Actual', 'Variance'],
            rows: [
              ['Revenue', '$X', '$Y', '+Z%'],
              ['Growth', 'X%', 'Y%', '+Z%'],
              ['Customers', 'X', 'Y', '+Z'],
            ],
            position: { x: 0.5, y: 1.5, w: 9, h: 2.5 },
          },
        ],
      },
      // Performance
      {
        type: 'section',
        number: 2,
        title: 'Performance Review',
        subtitle: 'Key metrics deep dive',
      },
      {
        type: 'two-column',
        title: 'Performance Highlights',
        left: {
          title: 'Wins',
          elements: [
            {
              type: 'bullets',
              items: ['Achievement 1', 'Achievement 2', 'Achievement 3'],
              position: { x: 0, y: 0, w: 4, h: 3 },
            },
          ],
        },
        right: {
          title: 'Challenges',
          elements: [
            {
              type: 'bullets',
              items: ['Challenge 1', 'Challenge 2', 'Challenge 3'],
              position: { x: 0, y: 0, w: 4, h: 3 },
            },
          ],
        },
      },
      // Financials
      {
        type: 'section',
        number: 3,
        title: 'Financial Review',
        subtitle: 'Revenue and profitability',
      },
      // Next Quarter
      {
        type: 'section',
        number: 4,
        title: 'Next Quarter Outlook',
        subtitle: 'Goals and priorities',
      },
      {
        type: 'content',
        title: 'Q+1 Priorities',
        elements: [
          {
            type: 'bullets',
            items: ['Priority 1', 'Priority 2', 'Priority 3', 'Priority 4'],
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Thank you
      {
        type: 'title',
        title: 'Questions?',
        subtitle: 'Thank you',
      },
    ];

    return {
      metadata: {
        title: config.title || 'Quarterly Review',
        author: config.author,
        company: config.company,
        subject: 'Quarterly Review',
      },
      settings: { layout: 'LAYOUT_16x9' },
      theme,
      slides,
    };
  }

  /**
   * Product Launch template
   */
  private createProductLaunch(
    config: TemplateConfig,
    theme: PresentationTheme
  ): PresentationSpec {
    const slides: SlideSpec[] = [
      // Title
      {
        type: 'title',
        title: config.title || 'Product Launch',
        subtitle: config.subtitle || 'Introducing something amazing',
        author: config.company,
        date: config.date,
      },
      // The Vision
      {
        type: 'quote',
        quote: 'Add your vision statement here',
        author: config.author || 'CEO',
        title: config.company,
      },
      // The Problem
      {
        type: 'section',
        number: 1,
        title: 'The Challenge',
        subtitle: 'Why we built this',
      },
      // The Solution
      {
        type: 'section',
        number: 2,
        title: 'Introducing [Product]',
        subtitle: 'A new way to...',
      },
      // Key Features
      {
        type: 'content',
        title: 'Key Features',
        elements: [
          {
            type: 'bullets',
            items: [
              'Feature 1: Description',
              'Feature 2: Description',
              'Feature 3: Description',
              'Feature 4: Description',
            ],
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Demo
      {
        type: 'section',
        number: 3,
        title: 'See It in Action',
        subtitle: 'Live demo',
      },
      // Pricing
      {
        type: 'section',
        number: 4,
        title: 'Pricing & Availability',
        subtitle: 'Get started today',
      },
      // Call to Action
      {
        type: 'content',
        title: 'Get Started',
        elements: [
          {
            type: 'text',
            content: 'Start your free trial today',
            position: { x: 0.5, y: 2, w: 9, h: 2 },
            style: { fontSize: 36, bold: true, align: 'center' },
          },
        ],
      },
      // Contact
      {
        type: 'title',
        title: 'Learn More',
        subtitle: 'www.example.com',
        author: config.company,
      },
    ];

    return {
      metadata: {
        title: config.title || 'Product Launch',
        author: config.author,
        company: config.company,
        subject: 'Product Launch',
      },
      settings: { layout: 'LAYOUT_16x9' },
      theme,
      slides,
    };
  }

  /**
   * Data Analysis template
   */
  private createDataAnalysis(
    config: TemplateConfig,
    theme: PresentationTheme
  ): PresentationSpec {
    const slides: SlideSpec[] = [
      // Title
      {
        type: 'title',
        title: config.title || 'Data Analysis Report',
        subtitle: config.subtitle || 'Insights and Findings',
        author: config.author,
        date: config.date,
      },
      // Executive Summary
      {
        type: 'section',
        number: 1,
        title: 'Executive Summary',
        subtitle: 'Key findings at a glance',
      },
      {
        type: 'content',
        title: 'Key Insights',
        elements: [
          {
            type: 'bullets',
            items: [
              'Insight 1: Description',
              'Insight 2: Description',
              'Insight 3: Description',
            ],
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Methodology
      {
        type: 'section',
        number: 2,
        title: 'Methodology',
        subtitle: 'Data sources and approach',
      },
      {
        type: 'content',
        title: 'Data Overview',
        elements: [
          {
            type: 'table',
            headers: ['Source', 'Records', 'Time Period'],
            rows: [
              ['Source 1', 'X,XXX', 'Jan-Dec 2024'],
              ['Source 2', 'X,XXX', 'Jan-Dec 2024'],
            ],
            position: { x: 0.5, y: 1.5, w: 9, h: 2 },
          },
        ],
      },
      // Analysis
      {
        type: 'section',
        number: 3,
        title: 'Analysis',
        subtitle: 'Deep dive into the data',
      },
      {
        type: 'content',
        title: 'Trend Analysis',
        elements: [
          {
            type: 'text',
            content: '[Insert chart here]',
            position: { x: 0.5, y: 1.5, w: 9, h: 3.5 },
            style: { align: 'center', color: '#999999' },
          },
        ],
        notes: 'Add your chart visualization here',
      },
      // Findings
      {
        type: 'section',
        number: 4,
        title: 'Key Findings',
        subtitle: 'What the data tells us',
      },
      {
        type: 'two-column',
        title: 'Finding 1',
        left: {
          title: 'Observation',
          elements: [
            {
              type: 'text',
              content: 'Description of finding',
              position: { x: 0, y: 0, w: 4, h: 3 },
            },
          ],
        },
        right: {
          title: 'Impact',
          elements: [
            {
              type: 'bullets',
              items: ['Implication 1', 'Implication 2'],
              position: { x: 0, y: 0, w: 4, h: 3 },
            },
          ],
        },
      },
      // Recommendations
      {
        type: 'section',
        number: 5,
        title: 'Recommendations',
        subtitle: 'Suggested actions',
      },
      {
        type: 'content',
        title: 'Action Items',
        elements: [
          {
            type: 'bullets',
            items: [
              'Recommendation 1',
              'Recommendation 2',
              'Recommendation 3',
            ],
            position: { x: 0.5, y: 1.3, w: 9, h: 4 },
          },
        ],
      },
      // Appendix
      {
        type: 'section',
        title: 'Appendix',
        subtitle: 'Supporting data',
      },
      // Thank you
      {
        type: 'title',
        title: 'Questions?',
        subtitle: 'Thank you',
        author: config.author,
      },
    ];

    return {
      metadata: {
        title: config.title || 'Data Analysis',
        author: config.author,
        company: config.company,
        subject: 'Data Analysis',
      },
      settings: { layout: 'LAYOUT_16x9' },
      theme,
      slides,
    };
  }
}

/**
 * Singleton instance
 */
let instance: TemplateService | null = null;

/**
 * Get singleton instance
 */
export function getTemplateService(): TemplateService {
  if (!instance) {
    instance = new TemplateService();
  }
  return instance;
}
