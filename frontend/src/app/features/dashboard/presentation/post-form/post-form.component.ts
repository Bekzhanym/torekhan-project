import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface PostFormValue {
  description: string;
  contact_link: string;
  skills_required: number[];
}

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css',
})
export class PostFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialValue: PostFormValue | null = null;
  @Input() isSaving = false;

  @Output() readonly submitted = new EventEmitter<PostFormValue>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly form = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required]],
    contactLink: ['', [Validators.required, Validators.maxLength(100)]],
    skillIds: ['', [Validators.required]],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      this.form.setValue({
        description: this.initialValue.description,
        contactLink: this.initialValue.contact_link,
        skillIds: this.initialValue.skills_required.join(', '),
      });
      this.form.markAsPristine();
    }

    if (changes['mode'] && this.mode === 'create' && !this.initialValue) {
      this.form.reset({
        description: '',
        contactLink: '',
        skillIds: '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const parsedSkillIds = raw.skillIds
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);

    if (!parsedSkillIds.length) {
      this.form.controls.skillIds.setErrors({ invalidIds: true });
      this.form.controls.skillIds.markAsTouched();
      return;
    }

    this.submitted.emit({
      description: raw.description.trim(),
      contact_link: raw.contactLink.trim(),
      skills_required: [...new Set(parsedSkillIds)],
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
