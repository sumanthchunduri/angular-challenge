import { DatePipe, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-part2',
  imports: [DatePipe, ReactiveFormsModule, TitleCasePipe, NgIf, NgFor],
  templateUrl: './part2.html',
  styleUrl: './part2.scss',
})
export class Part2 {
  recurrenceForm: FormGroup;
  selectedPattern: 'daily' | 'weekly' | 'monthly' | null = null;
  generatedSchedule: GeneratedSchedule | null = null;

  weekDays = [
    { name: 'Sunday', short: 'Sun', value: 'SUN' },
    { name: 'Monday', short: 'Mon', value: 'MON' },
    { name: 'Tuesday', short: 'Tue', value: 'TUE' },
    { name: 'Wednesday', short: 'Wed', value: 'WED' },
    { name: 'Thursday', short: 'Thu', value: 'THU' },
    { name: 'Friday', short: 'Fri', value: 'FRI' },
    { name: 'Saturday', short: 'Sat', value: 'SAT' },
  ];

  monthlyDates = Array.from({ length: 31 }, (_, i) => i + 1);

  selectedWeeklyDays: Set<string> = new Set();
  selectedMonthlyDate: number | null = null;

  constructor(private fb: FormBuilder) {
    this.recurrenceForm = this.createForm();
  }

  ngOnInit() {
    this.onPatternChange('daily');
  }

  private createForm(): FormGroup {
    return this.fb.group({
      patternType: ['daily', Validators.required],
      time: ['09:00', Validators.required],
      interval: [1, [Validators.required, Validators.min(1)]],
      monthlyDate: [1],
      endType: ['never'],
      endDate: [''],
      occurrences: [10, [Validators.min(1), Validators.max(100)]],
    });
  }

  onPatternChange(pattern: 'daily' | 'weekly' | 'monthly') {
    this.selectedPattern = pattern;
    this.generatedSchedule = null;

    this.selectedWeeklyDays.clear();
    this.selectedMonthlyDate = null;

    this.updateFormValidation();
  }

  private updateFormValidation() {
    const timeControl = this.recurrenceForm.get('time');
    const monthlyDateControl = this.recurrenceForm.get('monthlyDate');

    if (timeControl) {
      timeControl.setValidators([Validators.required]);
      timeControl.updateValueAndValidity();
    }

    if (monthlyDateControl && this.selectedPattern === 'monthly') {
      monthlyDateControl.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(31),
      ]);
      monthlyDateControl.updateValueAndValidity();
    }
  }

  onWeeklyDayChange(day: string, event: Event) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedWeeklyDays.add(day);
    } else {
      this.selectedWeeklyDays.delete(day);
    }
  }

  onMonthlyDateChange(date: number) {
    this.selectedMonthlyDate = date;
  }

  isWeeklyDaySelected(day: string): boolean {
    return this.selectedWeeklyDays.has(day);
  }

  generatePattern() {
    if (!this.recurrenceForm.valid || !this.selectedPattern) {
      return;
    }

    const formValue = this.recurrenceForm.value;

    if (this.selectedPattern === 'weekly' && this.selectedWeeklyDays.size === 0) {
      alert('Please select at least one day for weekly pattern');
      return;
    }

    if (this.selectedPattern === 'monthly' && !this.selectedMonthlyDate) {
      alert('Please select a date for monthly pattern');
      return;
    }

    const pattern: RecurrencePattern = {
      type: this.selectedPattern,
      time: formValue.time,
      interval: formValue.interval,
    };

    if (this.selectedPattern === 'weekly') {
      pattern.weeklyDays = Array.from(this.selectedWeeklyDays);
    }

    if (this.selectedPattern === 'monthly') {
      pattern.monthlyDate = this.selectedMonthlyDate!;
    }

    if (formValue.endType === 'date' && formValue.endDate) {
      pattern.endDate = formValue.endDate;
    }

    if (formValue.endType === 'occurrences' && formValue.occurrences) {
      pattern.occurrences = formValue.occurrences;
    }

    this.generatedSchedule = this.createSchedule(pattern);
  }

  private createSchedule(pattern: RecurrencePattern): GeneratedSchedule {
    const cronExpression = this.generateCronExpression(pattern);
    const description = this.generateDescription(pattern);
    const nextRuns = this.generateNextRuns(pattern);

    return {
      pattern,
      cronExpression,
      description,
      nextRuns,
    };
  }

  private generateCronExpression(pattern: RecurrencePattern): string {
    const [hours, minutes] = pattern.time.split(':').map(Number);

    switch (pattern.type) {
      case 'daily':
        if (pattern.interval === 1) {
          return `0 ${minutes} ${hours} * * ?`;
        } else {
          return `0 ${minutes} ${hours} */${pattern.interval} * ?`;
        }

      case 'weekly':
        if (!pattern.weeklyDays || pattern.weeklyDays.length === 0) {
          return `0 ${minutes} ${hours} ? * MON`;
        }

        const cronDays = pattern.weeklyDays
          .map((day) => {
            const dayMap: { [key: string]: string } = {
              SUN: '1',
              MON: '2',
              TUE: '3',
              WED: '4',
              THU: '5',
              FRI: '6',
              SAT: '7',
            };
            return dayMap[day];
          })
          .join(',');

        return `0 ${minutes} ${hours} ? * ${cronDays}`;

      case 'monthly':
        const dayOfMonth = pattern.monthlyDate || 1;
        if (pattern.interval === 1) {
          return `0 ${minutes} ${hours} ${dayOfMonth} * ?`;
        } else {
          return `0 ${minutes} ${hours} ${dayOfMonth} */${pattern.interval} ?`;
        }

      default:
        return `0 ${minutes} ${hours} * * ?`;
    }
  }

  private generateDescription(pattern: RecurrencePattern): string {
    const timeStr = this.formatTime(pattern.time);

    switch (pattern.type) {
      case 'daily':
        if (pattern.interval === 1) {
          return `Every day at ${timeStr}`;
        } else {
          return `Every ${pattern.interval} days at ${timeStr}`;
        }

      case 'weekly':
        if (!pattern.weeklyDays || pattern.weeklyDays.length === 0) {
          return `Every week at ${timeStr}`;
        }

        const dayNames = pattern.weeklyDays.map((day) => {
          const dayMap: { [key: string]: string } = {
            SUN: 'Sunday',
            MON: 'Monday',
            TUE: 'Tuesday',
            WED: 'Wednesday',
            THU: 'Thursday',
            FRI: 'Friday',
            SAT: 'Saturday',
          };
          return dayMap[day];
        });

        let daysStr = '';
        if (dayNames.length === 1) {
          daysStr = `every ${dayNames[0]}`;
        } else if (dayNames.length === 7) {
          daysStr = 'every day';
        } else {
          daysStr = `every ${dayNames.slice(0, -1).join(', ')} and ${dayNames.slice(-1)}`;
        }

        let str = pattern.interval === 1 ? '' : ` (every ${pattern.interval} weeks)`;
        return `${daysStr.charAt(0).toUpperCase() + daysStr.slice(1)} at ${timeStr}${str}`;

      case 'monthly':
        const dayOfMonth = pattern.monthlyDate || 1;
        const dayStr = this.getOrdinalNumber(dayOfMonth);
        const intervalStr =
          pattern.interval === 1 ? 'every month' : `every ${pattern.interval} months`;

        return `On the ${dayStr} of ${intervalStr} at ${timeStr}`;

      default:
        return `At ${timeStr}`;
    }
  }

  private generateNextRuns(pattern: RecurrencePattern): Date[] {
    const runs: Date[] = [];
    const now = new Date();
    const [hours, minutes] = pattern.time.split(':').map(Number);

    let currentDate = new Date(now);
    currentDate.setHours(hours, minutes, 0, 0);

    if (currentDate <= now) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    let count = 0;
    const maxRuns = pattern.occurrences || 5;

    while (count < Math.min(maxRuns, 10)) {
      let nextRun: Date | null = null;

      switch (pattern.type) {
        case 'daily':
          nextRun = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + (pattern.interval || 1));
          break;

        case 'weekly':
          nextRun = this.getNextWeeklyRun(currentDate, pattern.weeklyDays || ['MON']);
          if (nextRun) {
            currentDate = new Date(nextRun);
            currentDate.setDate(currentDate.getDate() + 7 * (pattern.interval || 1));
          }
          break;

        case 'monthly':
          nextRun = this.getNextMonthlyRun(currentDate, pattern.monthlyDate || 1);
          if (nextRun) {
            currentDate = new Date(nextRun);
            currentDate.setMonth(currentDate.getMonth() + (pattern.interval || 1));
          }
          break;
      }

      if (nextRun) {
        if (pattern.endDate && nextRun > new Date(pattern.endDate)) {
          break;
        }

        runs.push(nextRun);
        count++;
      } else {
        break;
      }
    }

    return runs;
  }

  private getNextWeeklyRun(startDate: Date, weeklyDays: string[]): Date | null {
    const dayMap: { [key: string]: number } = {
      SUN: 0,
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
    };

    const targetDays = weeklyDays.map((day) => dayMap[day]).sort((a, b) => a - b);
    const currentDay = startDate.getDay();

    for (const targetDay of targetDays) {
      if (targetDay >= currentDay) {
        const nextRun = new Date(startDate);
        nextRun.setDate(startDate.getDate() + (targetDay - currentDay));
        return nextRun;
      }
    }

    const nextRun = new Date(startDate);
    nextRun.setDate(startDate.getDate() + (7 - currentDay + targetDays[0]));
    return nextRun;
  }

  private getNextMonthlyRun(startDate: Date, dayOfMonth: number): Date | null {
    const nextRun = new Date(startDate);
    nextRun.setDate(dayOfMonth);

    if (nextRun <= startDate) {
      nextRun.setMonth(nextRun.getMonth() + 1);
    }

    if (nextRun.getDate() !== dayOfMonth) {
      nextRun.setDate(0);
    }

    return nextRun;
  }

  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  private getOrdinalNumber(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  }
}

type RecurrencePattern = {
  type: 'daily' | 'weekly' | 'monthly';
  time: string;
  weeklyDays?: string[];
  monthlyDate?: number;
  interval?: number;
  endDate?: string;
  occurrences?: number;
};

type GeneratedSchedule = {
  pattern: RecurrencePattern;
  cronExpression: string;
  description: string;
  nextRuns: Date[];
};
