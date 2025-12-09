/**
 * Types for presentation generation
 */

export interface PresentationSpec {
  metadata: PresentationMetadata;
  settings: PresentationSettings;
  theme?: PresentationTheme;
  masters?: MasterSlide[];
  slides: SlideSpec[];
}

export interface PresentationMetadata {
  title: string;
  author?: string;
  company?: string;
  subject?: string;
  revision?: string;
}

export interface PresentationSettings {
  layout: 'LAYOUT_16x9' | 'LAYOUT_4x3' | 'LAYOUT_WIDE';
  rtlMode?: boolean;
}

export interface PresentationTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing?: ThemeSpacing;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    heading: string;
    body: string;
  };
  sizes: {
    h1: string;
    h2: string;
    h3: string;
    body: string;
    caption: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface MasterSlide {
  name: string;
  background?: Background;
  elements?: SlideElement[];
}

export type SlideSpec =
  | TitleSlide
  | SectionSlide
  | ContentSlide
  | TwoColumnSlide
  | QuoteSlide;

export interface BaseSlide {
  master?: string;
  background?: Background;
  notes?: string;
  transition?: SlideTransition;
}

export interface TitleSlide extends BaseSlide {
  type: 'title';
  title: string;
  subtitle?: string;
  author?: string;
  date?: string;
}

export interface SectionSlide extends BaseSlide {
  type: 'section';
  title: string;
  subtitle?: string;
  number?: number;
}

export interface ContentSlide extends BaseSlide {
  type: 'content';
  title: string;
  elements: SlideElement[];
}

export interface TwoColumnSlide extends BaseSlide {
  type: 'two-column';
  title: string;
  left: ColumnContent;
  right: ColumnContent;
}

export interface QuoteSlide extends BaseSlide {
  type: 'quote';
  quote: string;
  author: string;
  title?: string;
}

export interface ColumnContent {
  title?: string;
  elements: SlideElement[];
}

export type SlideElement =
  | TextElement
  | BulletsElement
  | ImageElement
  | ChartElement
  | TableElement
  | ShapeElement;

export interface BaseElement {
  position: Position;
  animation?: ElementAnimation;
}

export interface Position {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string | RichTextPart[];
  style?: TextStyle;
}

export interface RichTextPart {
  text: string;
  options?: Partial<TextStyle>;
}

export interface TextStyle {
  fontFace?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
}

export interface BulletsElement extends BaseElement {
  type: 'bullets';
  items: (string | BulletItem)[];
  style?: TextStyle;
}

export interface BulletItem {
  text: string;
  indent?: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  path: string;
  sizing?: {
    type: 'contain' | 'cover' | 'stretch';
  };
  altText?: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: string;
  data: unknown[];
  series?: string[];
  options?: Record<string, unknown>;
}

export interface TableElement extends BaseElement {
  type: 'table';
  headers: string[];
  rows: string[][];
  style?: TableStyle;
}

export interface TableStyle {
  headerBackground?: string;
  headerColor?: string;
  alternateRows?: boolean;
  borderColor?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeType;
  style?: ShapeStyle;
  text?: {
    content: string;
    style?: TextStyle;
  };
}

export type ShapeType =
  | 'rect'
  | 'roundRect'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'arrow'
  | 'chevron'
  | 'line';

export interface ShapeStyle {
  fill?: string;
  line?: {
    color?: string;
    width?: number;
    dashType?: 'solid' | 'dash' | 'dot';
  };
  shadow?: {
    type?: 'outer' | 'inner';
    blur?: number;
    offset?: number;
  };
}

export interface Background {
  color?: string;
  image?: string;
}

export interface SlideTransition {
  type: 'fade' | 'slide' | 'zoom';
  duration?: number;
}

export interface ElementAnimation {
  type: 'fadeIn' | 'slideIn' | 'zoomIn';
  delay?: number;
  duration?: number;
}

export interface BuildResult {
  success: boolean;
  outputPath?: string;
  slideCount?: number;
  error?: string;
}
