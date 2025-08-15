import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-part1',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './part1.html',
  styleUrl: './part1.scss',
})
export class Part1 {
  cronControl = new FormControl('0 30 9 * * MON-FRI', [Validators.required]);

  isValid = true;
  errorMessage = '';
  parsedData: ParsedCron | null = null;


  private monthNames: { [key: string]: string } = {
    '1': 'January',
    '2': 'February',
    '3': 'March',
    '4': 'April',
    '5': 'May',
    '6': 'June',
    '7': 'July',
    '8': 'August',
    '9': 'September',
    '10': 'October',
    '11': 'November',
    '12': 'December',
  };

  private dayNames: { [key: string]: string } = {
    '0': 'Sunday',
    '1': 'Monday',
    '2': 'Tuesday',
    '3': 'Wednesday',
    '4': 'Thursday',
    '5': 'Friday',
    '6': 'Saturday',
    '7': 'Sunday',
  };

  private monthAbbreviations: { [key: string]: string } = {
    JAN: '1',
    FEB: '2',
    MAR: '3',
    APR: '4',
    MAY: '5',
    JUN: '6',
    JUL: '7',
    AUG: '8',
    SEP: '9',
    OCT: '10',
    NOV: '11',
    DEC: '12',
  };

  private dayAbbreviations: { [key: string]: string } = {
    SUN: '0',
    MON: '1',
    TUE: '2',
    WED: '3',
    THU: '4',
    FRI: '5',
    SAT: '6',
  };

  ngOnInit() {
    this.cronControl.valueChanges.subscribe((value) => {
      if (value) {
        this.parseCronExpression(value);
      }
    });
    this.parseCronExpression(this.cronControl.value || '');
  }

  setExample(expression: string) {
    this.cronControl.setValue(expression);
  }

  private parseCronExpression(expression: string) {
    try {
      this.parsedData = this.parse(expression);
      this.isValid = true;
      this.errorMessage = '';
    } catch (error) {
      this.isValid = false;
      this.errorMessage = (error as Error).message;
      this.parsedData = null;
    }
  }

  private parse(expression: string): ParsedCron {
    const parts = expression.trim().split(/\s+/);

    if (parts.length < 5 || parts.length > 7) {
      throw new Error('Cron expression must have 5, 6, or 7 parts');
    }

    let result: ParsedCron;

    if (parts.length === 5) {
      result = {
        minutes: this.parseField(parts[0], 0, 59, {}, {}),
        hours: this.parseField(parts[1], 0, 23, {}, {}),
        dayOfMonth: this.parseField(parts[2], 1, 31, {}, {}),
        month: this.parseField(parts[3], 1, 12, this.monthNames, this.monthAbbreviations),
        dayOfWeek: this.parseField(parts[4], 0, 6, this.dayNames, this.dayAbbreviations),
      };
    } else if (parts.length === 6) {
      result = {
        seconds: this.parseField(parts[0], 0, 59, {}, {}),
        minutes: this.parseField(parts[1], 0, 59, {}, {}),
        hours: this.parseField(parts[2], 0, 23, {}, {}),
        dayOfMonth: this.parseField(parts[3], 1, 31, {}, {}),
        month: this.parseField(parts[4], 1, 12, this.monthNames, this.monthAbbreviations),
        dayOfWeek: this.parseField(parts[5], 0, 6, this.dayNames, this.dayAbbreviations),
      };
    } else {
      result = {
        seconds: this.parseField(parts[0], 0, 59, {}, {}),
        minutes: this.parseField(parts[1], 0, 59, {}, {}),
        hours: this.parseField(parts[2], 0, 23, {}, {}),
        dayOfMonth: this.parseField(parts[3], 1, 31, {}, {}),
        month: this.parseField(parts[4], 1, 12, this.monthNames, this.monthAbbreviations),
        dayOfWeek: this.parseField(parts[5], 0, 6, this.dayNames, this.dayAbbreviations),
        year: this.parseField(parts[6], 1970, 3000, {}, {}),
      };
    }

    if (result.seconds) result.seconds.raw = parts[0];
    result.minutes.raw = parts[parts.length === 5 ? 0 : 1];
    result.hours.raw = parts[parts.length === 5 ? 1 : 2];
    result.dayOfMonth.raw = parts[parts.length === 5 ? 2 : 3];
    result.month.raw = parts[parts.length === 5 ? 3 : 4];
    result.dayOfWeek.raw = parts[parts.length === 5 ? 4 : 5];
    if (result.year) result.year.raw = parts[6];

    return result;
  }

  private parseField(
    field: string,
    min: number,
    max: number,
    names: { [key: string]: string } = {},
    abbreviations: { [key: string]: string } = {}
  ): ParsedField {
    if (field === '*') {
      return {
        raw: field,
        type: 'all',
        values: [],
        description: 'Every value',
      };
    }

    if (field === '?') {
      return {
        raw: field,
        type: 'any',
        values: [],
        description: 'Any value (no specific value)',
      };
    }

    let values: number[] = [];
    let description = '';
    let type: ParsedField['type'] = 'specific';

    if (field.includes('/')) {
      const [range, step] = field.split('/');
      const stepNum = parseInt(step);
      type = 'step';

      if (range === '*') {
        for (let i = min; i <= max; i += stepNum) {
          values.push(i);
        }
        description = `Every ${stepNum}${this.getOrdinalSuffix(stepNum)} value`;
      } else if (range.includes('-')) {
        const [start, end] = range.split('-').map((val) => {
          return abbreviations[val.toUpperCase()] || val;
        });
        for (let i = parseInt(start); i <= parseInt(end); i += stepNum) {
          values.push(i);
        }
        const startName =
          names[start.toUpperCase()] || names[abbreviations[start.toUpperCase()]] || start;
        const endName = names[end.toUpperCase()] || names[abbreviations[end.toUpperCase()]] || end;
        description = `Every ${stepNum}${this.getOrdinalSuffix(
          stepNum
        )} from ${startName} to ${endName}`;
      } else {
        const startVal = abbreviations[range.toUpperCase()] || range;
        for (let i = parseInt(startVal); i <= max; i += stepNum) {
          values.push(i);
        }
        const startName = names[range.toUpperCase()] || names[startVal] || range;
        description = `Every ${stepNum}${this.getOrdinalSuffix(
          stepNum
        )} starting from ${startName}`;
      }

      return { raw: field, type, values, description };
    }

    if (field.includes('-')) {
      const [start, end] = field.split('-');
      const startVal = abbreviations[start.toUpperCase()] || start;
      const endVal = abbreviations[end.toUpperCase()] || end;
      type = 'range';

      for (let i = parseInt(startVal); i <= parseInt(endVal); i++) {
        values.push(i);
      }

      const startName = names[start.toUpperCase()] || names[startVal] || start;
      const endName = names[end.toUpperCase()] || names[endVal] || end;
      description = `From ${startName} to ${endName}`;

      return { raw: field, type, values, description };
    }

    if (field.includes(',')) {
      const parts = field.split(',');
      type = 'list';
      values = parts.map((part) => {
        const val = abbreviations[part.toUpperCase()] || part;
        return parseInt(val);
      });

      const namesList = parts.map((part) => {
        const upperPart = part.toUpperCase();
        return names[upperPart] || names[abbreviations[upperPart]] || part;
      });

      description = namesList.join(', ');
      return { raw: field, type, values, description };
    }

    const singleVal = abbreviations[field.toUpperCase()] || field;
    values = [parseInt(singleVal)];
    const singleName = names[field.toUpperCase()] || names[singleVal] || field;
    description = singleName;

    return { raw: field, type: 'specific', values, description };
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return 'st';
    if (j == 2 && k != 12) return 'nd';
    if (j == 3 && k != 13) return 'rd';
    return 'th';
  }

  showValues(values: number[]): boolean {
    return values.length > 0 && values.length <= 20;
  }

  getMonthName(value: number): string {
    return this.monthNames[value.toString()] || value.toString();
  }

  getDayName(value: number): string {
    return this.dayNames[value.toString()] || value.toString();
  }

  getHumanReadableSchedule(): string {
    if (!this.parsedData) return '';

    const parts: string[] = [];

    if (this.parsedData.seconds && this.parsedData.seconds.type !== 'all') {
      if (this.parsedData.seconds.type === 'step') {
        parts.push(`every ${this.parsedData.seconds.description.toLowerCase()}`);
      } else {
        parts.push(`at ${this.parsedData.seconds.description} seconds`);
      }
    }

    if (this.parsedData.minutes.type !== 'all') {
      if (this.parsedData.minutes.type === 'step') {
        parts.push(`every ${this.parsedData.minutes.description.toLowerCase()}`);
      } else {
        parts.push(`at ${this.parsedData.minutes.description} minutes`);
      }
    }

    if (this.parsedData.hours.type !== 'all') {
      if (this.parsedData.hours.type === 'step') {
        parts.push(`every ${this.parsedData.hours.description.toLowerCase()}`);
      } else {
        parts.push(`at ${this.parsedData.hours.description}:00`);
      }
    }

    if (this.parsedData.dayOfMonth.type !== 'all' && this.parsedData.dayOfMonth.type !== 'any') {
      parts.push(`on ${this.parsedData.dayOfMonth.description} of the month`);
    }

    if (this.parsedData.month.type !== 'all') {
      parts.push(`in ${this.parsedData.month.description}`);
    }

    if (this.parsedData.dayOfWeek.type !== 'all' && this.parsedData.dayOfWeek.type !== 'any') {
      parts.push(`on ${this.parsedData.dayOfWeek.description}`);
    }

    if (this.parsedData.year && this.parsedData.year.type !== 'all') {
      parts.push(`in ${this.parsedData.year.description}`);
    }

    if (parts.length === 0) {
      return 'Runs every second';
    }

    return `Runs ${parts.join(' ')}`;
  }

  getNextRuns(): string[] {
    if (!this.parsedData) return [];

    const now = new Date();
    const runs: string[] = [];

    for (let i = 0; i < 5; i++) {
      const nextRun = new Date(now);

      if (this.parsedData.minutes.type === 'step' && this.parsedData.minutes.values.length > 0) {
        const interval = this.parsedData.minutes.values[1] - this.parsedData.minutes.values[0] || 1;
        nextRun.setMinutes(now.getMinutes() + interval * (i + 1));
      } else if (
        this.parsedData.minutes.type === 'specific' &&
        this.parsedData.minutes.values.length > 0
      ) {
        const nextMinute = this.parsedData.minutes.values[0];
        nextRun.setMinutes(nextMinute);
        nextRun.setHours(now.getHours() + (i + 1));
      } else {
        nextRun.setMinutes(now.getMinutes() + (i + 1) * 5);
      }

      runs.push(nextRun.toLocaleString());
    }

    return runs;
  }
}

type ParsedField = {
  raw: string;
  type: 'all' | 'any' | 'step' | 'range' | 'list' | 'specific';
  values: number[];
  description: string;
};

type ParsedCron = {
  seconds?: ParsedField;
  minutes: ParsedField;
  hours: ParsedField;
  dayOfMonth: ParsedField;
  month: ParsedField;
  dayOfWeek: ParsedField;
  year?: ParsedField;
};
