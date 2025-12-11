/**
 * PptxBuilderService - Generate PowerPoint presentations from specifications
 *
 * Features:
 * - Create presentations from JSON specifications
 * - Multiple slide types (title, section, content, two-column, quote)
 * - Theme support (colors, typography)
 * - Elements: text, bullets, tables, images, charts, shapes
 * - Master slide support
 */

import PptxGenJSModule from 'pptxgenjs';
import { existsSync, readFileSync } from 'node:fs';
import {
  getImageDimensions,
  calculateCenteredPosition,
} from '../utils/pptx-dimensions.js';
import type {
  Background,
  BuildResult,
  BulletsElement,
  ChartElement,
  ColumnContent,
  ContentSlide,
  ImageElement,
  MasterSlide,
  PresentationSettings,
  PresentationSpec,
  PresentationTheme,
  QuoteSlide,
  SectionSlide,
  ShapeElement,
  SlideElement,
  SlideSpec,
  TableElement,
  TextElement,
  TextStyle,
  ThemeColors,
  TitleSlide,
  TwoColumnSlide,
} from '../../types/presentation.js';

// Handle ESM/CJS compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PptxGenJS: any = (PptxGenJSModule as any).default || PptxGenJSModule;

/**
 * Default theme colors
 */
const DEFAULT_COLORS: ThemeColors = {
  primary: '#1E3A5F',
  secondary: '#4A6FA5',
  accent: '#EE6C4D',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
};

/**
 * Default theme
 */
const DEFAULT_THEME: PresentationTheme = {
  colors: DEFAULT_COLORS,
  typography: {
    fontFamily: {
      heading: 'Arial',
      body: 'Arial',
    },
    sizes: {
      h1: '44',
      h2: '32',
      h3: '24',
      body: '18',
      caption: '14',
    },
  },
  spacing: {
    xs: '0.25',
    sm: '0.5',
    md: '1',
    lg: '1.5',
    xl: '2',
  },
};

/**
 * Service for building PowerPoint presentations
 */
export class PptxBuilderService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pptx: any;
  private theme: PresentationTheme;
  private settings: PresentationSettings;

  constructor() {
    this.pptx = new PptxGenJS();
    this.theme = DEFAULT_THEME;
    this.settings = { layout: 'LAYOUT_16x9' };
  }

  /**
   * Build a presentation from specification
   */
  async build(spec: PresentationSpec, outputPath: string): Promise<BuildResult> {
    try {
      // Initialize new presentation
      this.pptx = new PptxGenJS();

      // Apply settings
      this.settings = spec.settings || { layout: 'LAYOUT_16x9' };
      this.pptx.layout = this.settings.layout;
      this.pptx.rtlMode = this.settings.rtlMode || false;

      // Apply metadata
      if (spec.metadata) {
        this.pptx.title = spec.metadata.title || '';
        this.pptx.author = spec.metadata.author || '';
        this.pptx.company = spec.metadata.company || '';
        this.pptx.subject = spec.metadata.subject || '';
        this.pptx.revision = spec.metadata.revision || '';
      }

      // Apply theme
      this.theme = this.mergeTheme(spec.theme);

      // Create master slides
      if (spec.masters) {
        for (const master of spec.masters) {
          this.createMasterSlide(master);
        }
      }

      // Create slides
      for (const slideSpec of spec.slides) {
        this.createSlide(slideSpec);
      }

      // Save presentation
      await this.pptx.writeFile({ fileName: outputPath });

      return {
        success: true,
        outputPath,
        slideCount: spec.slides.length,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Merge user theme with defaults
   */
  private mergeTheme(userTheme?: PresentationTheme): PresentationTheme {
    if (!userTheme) return DEFAULT_THEME;

    return {
      colors: { ...DEFAULT_COLORS, ...userTheme.colors },
      typography: {
        fontFamily: {
          ...DEFAULT_THEME.typography.fontFamily,
          ...userTheme.typography?.fontFamily,
        },
        sizes: {
          ...DEFAULT_THEME.typography.sizes,
          ...userTheme.typography?.sizes,
        },
      },
      spacing: {
        xs: userTheme.spacing?.xs ?? DEFAULT_THEME.spacing!.xs,
        sm: userTheme.spacing?.sm ?? DEFAULT_THEME.spacing!.sm,
        md: userTheme.spacing?.md ?? DEFAULT_THEME.spacing!.md,
        lg: userTheme.spacing?.lg ?? DEFAULT_THEME.spacing!.lg,
        xl: userTheme.spacing?.xl ?? DEFAULT_THEME.spacing!.xl,
      },
    };
  }

  /**
   * Create a master slide
   */
  private createMasterSlide(master: MasterSlide): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const masterDef: any = {
      title: master.name,
    };

    if (master.background) {
      masterDef.background = this.convertBackground(master.background);
    }

    // Add placeholder elements to master
    if (master.elements) {
      masterDef.objects = master.elements.map((el) => this.convertElementToMasterObject(el));
    }

    this.pptx.defineSlideMaster(masterDef);
  }

  /**
   * Convert element to master slide object
   */
  private convertElementToMasterObject(element: SlideElement): Record<string, unknown> {
    switch (element.type) {
      case 'text':
        return {
          text: {
            text: typeof element.content === 'string' ? element.content : '',
            options: {
              x: element.position.x,
              y: element.position.y,
              w: element.position.w,
              h: element.position.h,
              ...this.convertTextStyle(element.style),
            },
          },
        };
      case 'shape':
        return {
          rect: {
            x: element.position.x,
            y: element.position.y,
            w: element.position.w,
            h: element.position.h,
            fill: { color: element.style?.fill || this.theme.colors.surface },
          },
        };
      default:
        return {};
    }
  }

  /**
   * Create a slide based on type
   */
  private createSlide(spec: SlideSpec): void {
    switch (spec.type) {
      case 'title':
        this.createTitleSlide(spec);
        break;
      case 'section':
        this.createSectionSlide(spec);
        break;
      case 'content':
        this.createContentSlide(spec);
        break;
      case 'two-column':
        this.createTwoColumnSlide(spec);
        break;
      case 'quote':
        this.createQuoteSlide(spec);
        break;
      default:
        console.warn(`Unknown slide type: ${(spec as { type: string }).type}`);
    }
  }

  /**
   * Create title slide
   */
  private createTitleSlide(spec: TitleSlide): void {
    const slide = this.pptx.addSlide({ masterName: spec.master });

    // Apply background
    this.applyBackground(slide, spec.background || { color: this.theme.colors.primary });

    // Calculate positions based on whether we have subtitle and author/date
    // 16:9 slide is 10" x 5.625" in pptxgenjs
    const hasSubtitle = !!spec.subtitle;
    const hasFooter = !!(spec.author || spec.date);

    // Title positioning - centered vertically, adjusted if subtitle exists
    const titleY = hasSubtitle ? 1.8 : 2.2;

    // Add title
    slide.addText(spec.title, {
      x: 0.5,
      y: titleY,
      w: 9,
      h: 1.2,
      fontSize: parseInt(this.theme.typography.sizes.h1),
      fontFace: this.theme.typography.fontFamily.heading,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    // Add subtitle - positioned below title with proper spacing
    if (spec.subtitle) {
      slide.addText(spec.subtitle, {
        x: 0.5,
        y: titleY + 1.3,
        w: 9,
        h: 0.7,
        fontSize: parseInt(this.theme.typography.sizes.h2),
        fontFace: this.theme.typography.fontFamily.body,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });
    }

    // Add author and date at bottom - keep within slide bounds (max y ~4.5 for 16:9)
    if (hasFooter) {
      const bottomText = [spec.author, spec.date].filter(Boolean).join(' | ');
      slide.addText(bottomText, {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 0.5,
        fontSize: parseInt(this.theme.typography.sizes.body),
        fontFace: this.theme.typography.fontFamily.body,
        color: 'FFFFFF',
        align: 'center',
        valign: 'middle',
      });
    }

    // Add notes
    if (spec.notes) {
      slide.addNotes(spec.notes);
    }
  }

  /**
   * Create section slide
   */
  private createSectionSlide(spec: SectionSlide): void {
    const slide = this.pptx.addSlide({ masterName: spec.master });

    // Apply background
    this.applyBackground(slide, spec.background || { color: this.theme.colors.secondary });

    // Add section number if present
    if (spec.number !== undefined) {
      slide.addText(String(spec.number).padStart(2, '0'), {
        x: 0.5,
        y: 1,
        w: 2,
        h: 1,
        fontSize: 72,
        fontFace: this.theme.typography.fontFamily.heading,
        color: this.theme.colors.accent.replace('#', ''),
        bold: true,
      });
    }

    // Calculate widths based on whether we have a section number
    const hasNumber = spec.number !== undefined;
    const titleX = hasNumber ? 2.5 : 0.5;
    const titleW = hasNumber ? 7 : 9;

    // Add title
    slide.addText(spec.title, {
      x: titleX,
      y: 2.2,
      w: titleW,
      h: 1.2,
      fontSize: parseInt(this.theme.typography.sizes.h1),
      fontFace: this.theme.typography.fontFamily.heading,
      color: 'FFFFFF',
      bold: true,
      valign: 'middle',
    });

    // Add subtitle if present
    if (spec.subtitle) {
      slide.addText(spec.subtitle, {
        x: titleX,
        y: 3.5,
        w: titleW,
        h: 0.7,
        fontSize: parseInt(this.theme.typography.sizes.h3),
        fontFace: this.theme.typography.fontFamily.body,
        color: 'FFFFFF',
      });
    }

    if (spec.notes) {
      slide.addNotes(spec.notes);
    }
  }

  /**
   * Create content slide
   */
  private createContentSlide(spec: ContentSlide): void {
    const slide = this.pptx.addSlide({ masterName: spec.master });

    // Apply background
    this.applyBackground(slide, spec.background || { color: this.theme.colors.background });

    // Add title bar (10 inches is full width of 16:9 slide)
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      fill: { color: this.theme.colors.primary.replace('#', '') },
    });

    // Add title
    slide.addText(spec.title, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: parseInt(this.theme.typography.sizes.h2),
      fontFace: this.theme.typography.fontFamily.heading,
      color: 'FFFFFF',
      bold: true,
      valign: 'middle',
    });

    // Add elements
    for (const element of spec.elements) {
      this.addElement(slide, element);
    }

    if (spec.notes) {
      slide.addNotes(spec.notes);
    }
  }

  /**
   * Create two-column slide
   */
  private createTwoColumnSlide(spec: TwoColumnSlide): void {
    const slide = this.pptx.addSlide({ masterName: spec.master });

    // Apply background
    this.applyBackground(slide, spec.background || { color: this.theme.colors.background });

    // Add title bar (10 inches is full width of 16:9 slide)
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      fill: { color: this.theme.colors.primary.replace('#', '') },
    });

    // Add title
    slide.addText(spec.title, {
      x: 0.5,
      y: 0.2,
      w: 9,
      h: 0.6,
      fontSize: parseInt(this.theme.typography.sizes.h2),
      fontFace: this.theme.typography.fontFamily.heading,
      color: 'FFFFFF',
      bold: true,
      valign: 'middle',
    });

    // Add left column
    this.addColumnContent(slide, spec.left, 0.5, 4.5);

    // Add vertical divider
    slide.addShape('line', {
      x: 5,
      y: 1.2,
      w: 0,
      h: 4,
      line: { color: this.theme.colors.surface.replace('#', ''), width: 1 },
    });

    // Add right column
    this.addColumnContent(slide, spec.right, 5.2, 4.3);

    if (spec.notes) {
      slide.addNotes(spec.notes);
    }
  }

  /**
   * Add column content
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addColumnContent(slide: any, content: ColumnContent, startX: number, width: number): void {
    let currentY = 1.3;

    // Add column title if present
    if (content.title) {
      slide.addText(content.title, {
        x: startX,
        y: currentY,
        w: width,
        h: 0.5,
        fontSize: parseInt(this.theme.typography.sizes.h3),
        fontFace: this.theme.typography.fontFamily.heading,
        color: this.theme.colors.primary.replace('#', ''),
        bold: true,
      });
      currentY += 0.6;
    }

    // Add elements with adjusted positions
    for (const element of content.elements) {
      const adjustedElement = {
        ...element,
        position: {
          x: startX,
          y: currentY,
          w: width,
          h: element.position.h,
        },
      };
      this.addElement(slide, adjustedElement as SlideElement);
      currentY += element.position.h + 0.2;
    }
  }

  /**
   * Create quote slide
   */
  private createQuoteSlide(spec: QuoteSlide): void {
    const slide = this.pptx.addSlide({ masterName: spec.master });

    // Apply background
    this.applyBackground(slide, spec.background || { color: this.theme.colors.surface });

    // Add large quote mark
    slide.addText('"', {
      x: 0.5,
      y: 1,
      w: 1,
      h: 1.5,
      fontSize: 120,
      fontFace: 'Georgia',
      color: this.theme.colors.accent.replace('#', ''),
    });

    // Add quote text (7.5 inches = 75% of 10 inch width)
    slide.addText(spec.quote, {
      x: 1.5,
      y: 1.5,
      w: 7.5,
      h: 2.5,
      fontSize: parseInt(this.theme.typography.sizes.h2),
      fontFace: 'Georgia',
      color: this.theme.colors.text.primary.replace('#', ''),
      italic: true,
      valign: 'middle',
    });

    // Add author
    slide.addText(`— ${spec.author}`, {
      x: 1.5,
      y: 4.2,
      w: 7.5,
      h: 0.5,
      fontSize: parseInt(this.theme.typography.sizes.body),
      fontFace: this.theme.typography.fontFamily.body,
      color: this.theme.colors.text.secondary.replace('#', ''),
    });

    // Add title if present
    if (spec.title) {
      slide.addText(spec.title, {
        x: 1.5,
        y: 4.7,
        w: 7.5,
        h: 0.4,
        fontSize: parseInt(this.theme.typography.sizes.caption),
        fontFace: this.theme.typography.fontFamily.body,
        color: this.theme.colors.text.secondary.replace('#', ''),
        italic: true,
      });
    }

    if (spec.notes) {
      slide.addNotes(spec.notes);
    }
  }

  /**
   * Add an element to a slide
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addElement(slide: any, element: SlideElement): void {
    switch (element.type) {
      case 'text':
        this.addTextElement(slide, element);
        break;
      case 'bullets':
        this.addBulletsElement(slide, element);
        break;
      case 'table':
        this.addTableElement(slide, element);
        break;
      case 'image':
        this.addImageElement(slide, element);
        break;
      case 'chart':
        this.addChartElement(slide, element);
        break;
      case 'shape':
        this.addShapeElement(slide, element);
        break;
      default:
        console.warn(`Unknown element type: ${(element as SlideElement).type}`);
    }
  }

  /**
   * Add text element
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addTextElement(slide: any, element: TextElement): void {
    const content = typeof element.content === 'string'
      ? element.content
      : element.content.map((part) => ({
          text: part.text,
          options: this.convertTextStyle(part.options),
        }));

    slide.addText(content, {
      x: element.position.x,
      y: element.position.y,
      w: element.position.w,
      h: element.position.h,
      ...this.convertTextStyle(element.style),
    });
  }

  /**
   * Add bullets element
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addBulletsElement(slide: any, element: BulletsElement): void {
    const textContent = element.items.map((item) => {
      if (typeof item === 'string') {
        return {
          text: item,
          options: {
            bullet: true,
            indentLevel: 0,
          },
        };
      }
      return {
        text: item.text,
        options: {
          bullet: true,
          indentLevel: item.indent || 0,
        },
      };
    });

    slide.addText(textContent, {
      x: element.position.x,
      y: element.position.y,
      w: element.position.w,
      h: element.position.h,
      fontSize: parseInt(this.theme.typography.sizes.body),
      fontFace: this.theme.typography.fontFamily.body,
      color: this.theme.colors.text.primary.replace('#', ''),
      paraSpaceBefore: 6,
      paraSpaceAfter: 6,
      ...this.convertTextStyle(element.style),
    });
  }

  /**
   * Add table element
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addTableElement(slide: any, element: TableElement): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows: any[][] = [];

    // Add header row
    rows.push(
      element.headers.map((header) => ({
        text: header,
        options: {
          fill: { color: (element.style?.headerBackground || this.theme.colors.primary).replace('#', '') },
          color: (element.style?.headerColor || 'FFFFFF').replace('#', ''),
          bold: true,
          align: 'center',
        },
      }))
    );

    // Add data rows
    element.rows.forEach((row, index) => {
      const rowFill =
        element.style?.alternateRows && index % 2 === 1
          ? { color: this.theme.colors.surface.replace('#', '') }
          : undefined;

      rows.push(
        row.map((cell) => ({
          text: cell,
          options: {
            fill: rowFill,
            color: this.theme.colors.text.primary.replace('#', ''),
          },
        }))
      );
    });

    slide.addTable(rows, {
      x: element.position.x,
      y: element.position.y,
      w: element.position.w,
      h: element.position.h,
      fontSize: parseInt(this.theme.typography.sizes.body) - 2,
      fontFace: this.theme.typography.fontFamily.body,
      border: {
        type: 'solid',
        color: (element.style?.borderColor || this.theme.colors.surface).replace('#', ''),
        pt: 1,
      },
      colW: element.position.w / element.headers.length,
      rowH: 0.4,
    });
  }

  /**
   * Add image element with automatic centering for contain mode
   *
   * For 'contain' mode: reads actual image dimensions and calculates
   * centered position to avoid top-left alignment issues with pptxgenjs.
   *
   * For 'cover' mode: uses pptxgenjs native handling (centers and crops).
   * For 'stretch' mode: stretches image to fill the container.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addImageElement(slide: any, element: ImageElement): void {
    if (!existsSync(element.path)) {
      console.warn(`Image not found: ${element.path}`);
      // Add placeholder
      slide.addShape('rect', {
        x: element.position.x,
        y: element.position.y,
        w: element.position.w,
        h: element.position.h,
        fill: { color: this.theme.colors.surface.replace('#', '') },
        line: { color: this.theme.colors.text.secondary.replace('#', ''), dashType: 'dash' },
      });
      slide.addText('Image not found', {
        x: element.position.x,
        y: element.position.y,
        w: element.position.w,
        h: element.position.h,
        align: 'center',
        valign: 'middle',
        fontSize: 12,
        color: this.theme.colors.text.secondary.replace('#', ''),
      });
      return;
    }

    const sizingType = element.sizing?.type || 'contain';

    // For 'contain' mode, calculate centered position manually
    // This fixes pptxgenjs behavior where 'contain' positions image at top-left
    if (sizingType === 'contain') {
      const buffer = readFileSync(element.path);
      const dimensions = getImageDimensions(buffer);

      if (dimensions) {
        // Calculate centered position based on actual image ratio
        const centered = calculateCenteredPosition(element.position, dimensions);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const imageOptions: any = {
          path: element.path,
          x: centered.x,
          y: centered.y,
          w: centered.w,
          h: centered.h,
        };

        if (element.altText) {
          imageOptions.altText = element.altText;
        }

        slide.addImage(imageOptions);
        return;
      }
      // Fall through to default behavior if dimensions couldn't be read
    }

    // Default behavior for 'cover', 'stretch', or when dimensions unavailable
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageOptions: any = {
      path: element.path,
      x: element.position.x,
      y: element.position.y,
      w: element.position.w,
      h: element.position.h,
    };

    if (sizingType === 'cover') {
      // Cover mode: pptxgenjs handles centering and cropping correctly
      imageOptions.sizing = { type: 'cover', w: element.position.w, h: element.position.h };
    }
    // For 'stretch', no sizing option = image stretches to fill

    if (element.altText) {
      imageOptions.altText = element.altText;
    }

    slide.addImage(imageOptions);
  }

  /**
   * Add chart element (using pptxgenjs built-in charts)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addChartElement(slide: any, element: ChartElement): void {
    const chartType = this.mapChartType(element.chartType);

    if (!chartType) {
      console.warn(`Unsupported chart type: ${element.chartType}`);
      return;
    }

    const chartData = element.series
      ? element.series.map((name, i) => ({
          name,
          labels: element.data.map((d) => String((d as unknown[])[0] || '')),
          values: element.data.map((d) => Number((d as unknown[])[i + 1] || 0)),
        }))
      : [
          {
            name: 'Data',
            labels: element.data.map((d) => String((d as unknown[])[0] || '')),
            values: element.data.map((d) => Number((d as unknown[])[1] || 0)),
          },
        ];

    slide.addChart(chartType, chartData, {
      x: element.position.x,
      y: element.position.y,
      w: element.position.w,
      h: element.position.h,
      showTitle: false,
      chartColors: this.theme.colors ? [
        this.theme.colors.primary.replace('#', ''),
        this.theme.colors.secondary.replace('#', ''),
        this.theme.colors.accent.replace('#', ''),
      ] : undefined,
      ...(element.options || {}),
    });
  }

  /**
   * Map chart type string to pptxgenjs chart type
   */
  private mapChartType(type: string): string | null {
    const mapping: Record<string, string> = {
      bar: 'bar',
      barH: 'bar',
      line: 'line',
      area: 'area',
      pie: 'pie',
      doughnut: 'doughnut',
      scatter: 'scatter',
      radar: 'radar',
    };

    return mapping[type] || null;
  }

  /**
   * Add shape element
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addShapeElement(slide: any, element: ShapeElement): void {
    const shapeType = this.mapShapeType(element.shape);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shapeOptions: any = {
      x: element.position.x,
      y: element.position.y,
      w: element.position.w,
      h: element.position.h,
    };

    if (element.style?.fill) {
      shapeOptions.fill = { color: element.style.fill.replace('#', '') };
    }

    if (element.style?.line) {
      shapeOptions.line = {
        color: element.style.line.color?.replace('#', ''),
        width: element.style.line.width,
        dashType: element.style.line.dashType === 'dash' ? 'dash' :
                  element.style.line.dashType === 'dot' ? 'sysDot' : 'solid',
      };
    }

    if (element.style?.shadow) {
      shapeOptions.shadow = {
        type: element.style.shadow.type || 'outer',
        blur: element.style.shadow.blur || 3,
        offset: element.style.shadow.offset || 3,
        angle: 45,
        opacity: 0.3,
      };
    }

    slide.addShape(shapeType, shapeOptions);

    // Add text inside shape if present
    if (element.text) {
      slide.addText(element.text.content, {
        x: element.position.x,
        y: element.position.y,
        w: element.position.w,
        h: element.position.h,
        align: 'center',
        valign: 'middle',
        ...this.convertTextStyle(element.text.style),
      });
    }
  }

  /**
   * Map shape type to pptxgenjs shape name
   */
  private mapShapeType(shape: string): string {
    const mapping: Record<string, string> = {
      rect: 'rect',
      roundRect: 'roundRect',
      ellipse: 'ellipse',
      triangle: 'triangle',
      diamond: 'diamond',
      arrow: 'rightArrow',
      chevron: 'chevron',
      line: 'line',
    };

    return mapping[shape] || 'rect';
  }

  /**
   * Apply background to slide
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyBackground(slide: any, background: Background): void {
    if (background.color) {
      slide.background = { color: background.color.replace('#', '') };
    } else if (background.image && existsSync(background.image)) {
      slide.background = { path: background.image };
    }
  }

  /**
   * Convert background to pptxgenjs format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertBackground(background: Background): any {
    if (background.color) {
      return { color: background.color.replace('#', '') };
    }
    if (background.image) {
      return { path: background.image };
    }
    return { color: 'FFFFFF' };
  }

  /**
   * Convert text style to pptxgenjs format
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private convertTextStyle(style?: TextStyle): any {
    if (!style) return {};

    return {
      fontFace: style.fontFace || this.theme.typography.fontFamily.body,
      fontSize: style.fontSize || parseInt(this.theme.typography.sizes.body),
      color: (style.color || this.theme.colors.text.primary).replace('#', ''),
      bold: style.bold,
      italic: style.italic,
      underline: style.underline ? { style: 'sng' } : undefined,
      align: style.align,
      valign: style.valign,
    };
  }

  /**
   * Quick method to create a simple presentation
   */
  async createSimplePresentation(
    title: string,
    slides: Array<{ title: string; bullets: string[] }>,
    outputPath: string
  ): Promise<BuildResult> {
    const spec: PresentationSpec = {
      metadata: { title },
      settings: { layout: 'LAYOUT_16x9' },
      slides: [
        {
          type: 'title',
          title,
          date: new Date().toISOString().split('T')[0],
        },
        ...slides.map((s) => ({
          type: 'content' as const,
          title: s.title,
          elements: [
            {
              type: 'bullets' as const,
              items: s.bullets,
              position: { x: 0.5, y: 1.3, w: 9, h: 4 },
            },
          ],
        })),
      ],
    };

    return this.build(spec, outputPath);
  }
}

/**
 * Default instance
 */
export const pptxBuilderService = new PptxBuilderService();
