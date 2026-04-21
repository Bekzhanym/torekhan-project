import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface ApplyFormValue {
  description: string;
}

@Component({
  selector: 'app-apply-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-form.component.html',
  styleUrl: './apply-form.component.css',
})
export class ApplyFormComponent {
  private readonly formBuilder = inject(FormBuilder);

  @Input() postId: number | null = null;
  @Input() isSaving = false;

  @Output() readonly submitted = new EventEmitter<ApplyFormValue>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly form = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit({
      description: this.form.controls.description.getRawValue().trim(),
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
