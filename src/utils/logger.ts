/**
 * Structured logging utility for skill execution observability
 *
 * Provides JSON-formatted logs for tracking skill executions,
 * data flows, and errors across the workflow pipeline.
 */

// =============================================================================
// LOG TYPES
// =============================================================================

export type SkillName =
  | 'data-reader'
  | 'pdf-reader'
  | 'web-scraper'
  | 'data-analyst'
  | 'data-storytelling'
  | 'presentation-architect'
  | 'theme-designer'
  | 'chart-generator'
  | 'diagram-generator'
  | 'map-generator'
  | 'icon-finder'
  | 'stock-photo-finder'
  | 'pptx-builder';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type SkillAction = 'start' | 'success' | 'error' | 'validation_error';

export interface SkillLogInput {
  type: string;
  path?: string;
  size?: number;
  metadata?: Record<string, unknown>;
}

export interface SkillLogOutput {
  type: string;
  path?: string;
  size?: number;
  count?: number;
  metadata?: Record<string, unknown>;
}

export interface SkillLog {
  timestamp: string;
  level: LogLevel;
  skill: SkillName;
  action: SkillAction;
  input?: SkillLogInput;
  output?: SkillLogOutput;
  duration?: number;
  error?: string;
  errorCode?: string;
  validationErrors?: string[];
  metadata?: Record<string, unknown>;
}

export interface WorkflowLog {
  timestamp: string;
  level: LogLevel;
  workflow: string;
  action: 'start' | 'step' | 'complete' | 'error';
  currentSkill?: SkillName;
  progress?: {
    completed: number;
    total: number;
    percentage: number;
  };
  duration?: number;
  error?: string;
}

// =============================================================================
// LOGGER CLASS
// =============================================================================

export class SkillLogger {
  private skill: SkillName;
  private startTime?: number;
  private silent: boolean;

  constructor(skill: SkillName, options?: { silent?: boolean }) {
    this.skill = skill;
    this.silent = options?.silent ?? false;
  }

  /**
   * Logs the start of a skill execution
   */
  start(input?: SkillLogInput): void {
    this.startTime = Date.now();
    this.log({
      level: 'info',
      skill: this.skill,
      action: 'start',
      input,
    });
  }

  /**
   * Logs successful completion of a skill
   */
  success(output?: SkillLogOutput, metadata?: Record<string, unknown>): void {
    const duration = this.startTime ? Date.now() - this.startTime : undefined;
    this.log({
      level: 'info',
      skill: this.skill,
      action: 'success',
      output,
      duration,
      metadata,
    });
  }

  /**
   * Logs an error during skill execution
   */
  error(error: Error | string, errorCode?: string): void {
    const duration = this.startTime ? Date.now() - this.startTime : undefined;
    const errorMessage = error instanceof Error ? error.message : error;
    this.log({
      level: 'error',
      skill: this.skill,
      action: 'error',
      error: errorMessage,
      errorCode,
      duration,
    });
  }

  /**
   * Logs a validation error (contract violation)
   */
  validationError(errors: string[], context?: string): void {
    this.log({
      level: 'warn',
      skill: this.skill,
      action: 'validation_error',
      validationErrors: errors,
      metadata: context ? { context } : undefined,
    });
  }

  /**
   * Internal logging method
   */
  private log(entry: Omit<SkillLog, 'timestamp'>): void {
    if (this.silent) return;

    const log: SkillLog = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    const output = JSON.stringify(log);

    if (entry.level === 'error') {
      console.error(output);
    } else if (entry.level === 'warn') {
      console.warn(output);
    } else {
      console.log(output);
    }
  }
}

// =============================================================================
// WORKFLOW LOGGER
// =============================================================================

export class WorkflowLogger {
  private workflowName: string;
  private startTime?: number;
  private steps: SkillName[] = [];
  private currentStep = 0;
  private silent: boolean;

  constructor(workflowName: string, steps: SkillName[], options?: { silent?: boolean }) {
    this.workflowName = workflowName;
    this.steps = steps;
    this.silent = options?.silent ?? false;
  }

  /**
   * Logs workflow start
   */
  start(): void {
    this.startTime = Date.now();
    this.currentStep = 0;
    this.log({
      level: 'info',
      workflow: this.workflowName,
      action: 'start',
      progress: this.getProgress(),
    });
  }

  /**
   * Logs progress to next step
   */
  step(skill: SkillName): void {
    this.currentStep++;
    this.log({
      level: 'info',
      workflow: this.workflowName,
      action: 'step',
      currentSkill: skill,
      progress: this.getProgress(),
    });
  }

  /**
   * Logs workflow completion
   */
  complete(): void {
    const duration = this.startTime ? Date.now() - this.startTime : undefined;
    this.log({
      level: 'info',
      workflow: this.workflowName,
      action: 'complete',
      progress: { completed: this.steps.length, total: this.steps.length, percentage: 100 },
      duration,
    });
  }

  /**
   * Logs workflow error
   */
  error(error: Error | string, failedSkill?: SkillName): void {
    const duration = this.startTime ? Date.now() - this.startTime : undefined;
    const errorMessage = error instanceof Error ? error.message : error;
    this.log({
      level: 'error',
      workflow: this.workflowName,
      action: 'error',
      currentSkill: failedSkill,
      progress: this.getProgress(),
      error: errorMessage,
      duration,
    });
  }

  private getProgress() {
    return {
      completed: this.currentStep,
      total: this.steps.length,
      percentage: Math.round((this.currentStep / this.steps.length) * 100),
    };
  }

  private log(entry: Omit<WorkflowLog, 'timestamp'>): void {
    if (this.silent) return;

    const log: WorkflowLog = {
      timestamp: new Date().toISOString(),
      ...entry,
    };

    const output = JSON.stringify(log);

    if (entry.level === 'error') {
      console.error(output);
    } else {
      console.log(output);
    }
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Creates a logger for a specific skill
 */
export function createSkillLogger(skill: SkillName, options?: { silent?: boolean }): SkillLogger {
  return new SkillLogger(skill, options);
}

/**
 * Creates a workflow logger with predefined steps
 */
export function createWorkflowLogger(
  name: string,
  steps: SkillName[],
  options?: { silent?: boolean }
): WorkflowLogger {
  return new WorkflowLogger(name, steps, options);
}

/**
 * Simple one-shot skill execution log
 */
export function logSkillExecution(
  skill: SkillName,
  action: SkillAction,
  details?: {
    input?: SkillLogInput;
    output?: SkillLogOutput;
    duration?: number;
    error?: string;
  }
): void {
  const log: SkillLog = {
    timestamp: new Date().toISOString(),
    level: action === 'error' || action === 'validation_error' ? 'error' : 'info',
    skill,
    action,
    ...details,
  };

  const output = JSON.stringify(log);

  if (log.level === 'error') {
    console.error(output);
  } else {
    console.log(output);
  }
}

// =============================================================================
// PREDEFINED WORKFLOW TEMPLATES
// =============================================================================

/**
 * Standard presentation workflow steps
 */
export const PRESENTATION_WORKFLOW_STEPS: SkillName[] = [
  'data-reader',
  'data-analyst',
  'presentation-architect',
  'chart-generator',
  'pptx-builder',
];

/**
 * Full presentation workflow with all optional steps
 */
export const FULL_PRESENTATION_WORKFLOW_STEPS: SkillName[] = [
  'data-reader',
  'data-analyst',
  'data-storytelling',
  'presentation-architect',
  'theme-designer',
  'chart-generator',
  'diagram-generator',
  'stock-photo-finder',
  'pptx-builder',
];
