import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

export interface PostFormValue {
  description: string;
  contact_link: string;
  skills_required: number[];
}

export interface SkillOption {
  id: number;
  name: string;
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
  @Input() skills: SkillOption[] = [];
  @Input() isSkillsLoading = false;
  @Input() skillsError: string | null = null;

  @Output() readonly submitted = new EventEmitter<PostFormValue>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly form = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required]],
    contactLink: ['', [Validators.required, Validators.maxLength(100)]],
    skillIds: this.formBuilder.nonNullable.control<number[]>([], [Validators.required]),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialValue'] && this.initialValue) {
      this.form.setValue({
        description: this.initialValue.description,
        contactLink: this.initialValue.contact_link,
        skillIds: [...this.initialValue.skills_required],
      });
      this.form.markAsPristine();
    }

    if (changes['mode'] && this.mode === 'create' && !this.initialValue) {
      this.form.reset({
        description: '',
        contactLink: '',
        skillIds: [],
      });
    }
  }

  isSkillSelected(skillId: number): boolean {
    return this.form.controls.skillIds.value.includes(skillId);
  }

  toggleSkill(skillId: number, checked: boolean): void {
    const selectedSkillIds = this.form.controls.skillIds.value;
    const nextValue = checked
      ? Array.from(new Set([...selectedSkillIds, skillId]))
      : selectedSkillIds.filter((id) => id !== skillId);
    this.form.controls.skillIds.setValue(nextValue);
    this.form.controls.skillIds.markAsTouched();
    this.form.controls.skillIds.updateValueAndValidity();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    this.submitted.emit({
      description: raw.description.trim(),
      contact_link: raw.contactLink.trim(),
      skills_required: raw.skillIds,
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
