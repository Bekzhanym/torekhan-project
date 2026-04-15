import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { API_BASE_URL, API_ENDPOINTS } from '../../../../shared/constants/api.constants';

interface UserSkill {
  user_skill_id: number;
  user_spec_id?: number;
  skill_id: number;
  skill_name: string;
  level: number;
}

interface UserSpecialization {
  spec_id: number;
  spec_name: string;
  user_spec_id: number;
  level: number;
  skills: UserSkill[];
}

interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  telegram: string | null;
  phone_number: string | null;
  role: string;
  specializations: UserSpecialization[];
}

interface ProfilePost {
  id: number;
  description: string;
  created_at: string;
  contact_link: string;
  skills_required: Array<{ id: number; name: string }>;
}

interface CatalogSkill {
  id: number;
  name: string;
  specialization: number | null;
}

interface CatalogSpecialization {
  id: number;
  name: string;
}

type ProfileModalType =
  | 'edit-contacts'
  | 'add-specialization'
  | 'add-skill'
  | 'edit-skill'
  | 'edit-specialization-level'
  | 'edit-skill-level'
  | null;

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);

  readonly profile = signal<ProfileResponse | null>(null);
  readonly myPosts = signal<ProfilePost[]>([]);
  readonly specializationsCatalog = signal<CatalogSpecialization[]>([]);
  readonly skillsCatalog = signal<CatalogSkill[]>([]);

  readonly isProfileLoading = signal(true);
  readonly isPostsLoading = signal(true);
  readonly isCatalogsLoading = signal(true);
  readonly isSaving = signal(false);

  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly editingPostId = signal<number | null>(null);
  readonly specializationSearch = signal('');
  readonly skillSearch = signal('');
  readonly editSkillSearch = signal('');
  readonly isSpecializationDropdownOpen = signal(false);
  readonly isSkillDropdownOpen = signal(false);
  readonly isEditSkillDropdownOpen = signal(false);
  readonly activeModal = signal<ProfileModalType>(null);
  readonly editingSpecializationId = signal<number | null>(null);
  readonly editingSkillId = signal<number | null>(null);
  readonly editingSkillCurrentSkillId = signal<number | null>(null);

  readonly contactEditForm = this.formBuilder.group({
    telegram: [null as string | null, [Validators.maxLength(50)]],
    phoneNumber: [null as string | null, [Validators.maxLength(20)]],
  });

  readonly addSpecializationForm = this.formBuilder.group({
    specializationId: [null as number | null, [Validators.required, Validators.min(1)]],
    level: [null as number | null, [Validators.required, Validators.min(1), Validators.max(10)]],
  });

  readonly addSkillForm = this.formBuilder.group({
    userSpecId: [null as number | null, [Validators.required, Validators.min(1)]],
    skillId: [null as number | null, [Validators.required, Validators.min(1)]],
    level: [null as number | null, [Validators.required, Validators.min(1), Validators.max(10)]],
  });

  readonly postEditForm = this.formBuilder.nonNullable.group({
    description: ['', [Validators.required]],
    contactLink: ['', [Validators.required, Validators.maxLength(100)]],
    skillIds: ['', [Validators.required]],
  });

  readonly editLevelForm = this.formBuilder.group({
    level: [null as number | null, [Validators.required, Validators.min(1), Validators.max(10)]],
  });

  readonly editSkillForm = this.formBuilder.group({
    userSpecId: [null as number | null, [Validators.required, Validators.min(1)]],
    skillId: [null as number | null, [Validators.required, Validators.min(1)]],
    level: [null as number | null, [Validators.required, Validators.min(1), Validators.max(10)]],
  });

  readonly filteredSpecializations = computed(() => {
    const searchTerm = this.specializationSearch().trim().toLowerCase();
    if (!searchTerm) {
      return this.specializationsCatalog();
    }

    return this.specializationsCatalog().filter((specialization) =>
      specialization.name.toLowerCase().includes(searchTerm),
    );
  });

  ngOnInit(): void {
    this.loadProfile();
    this.loadMyPosts();
    this.loadCatalogs();
  }

  loadProfile(): void {
    this.isProfileLoading.set(true);
    this.error.set(null);

    this.http.get<ProfileResponse>(`${API_BASE_URL}${API_ENDPOINTS.usersMe}`).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.contactEditForm.setValue({
          telegram: profile.telegram,
          phoneNumber: profile.phone_number,
        });
        const currentUserSpecId = this.addSkillForm.controls.userSpecId.getRawValue();
        if (!currentUserSpecId && profile.specializations.length) {
          this.addSkillForm.controls.userSpecId.setValue(profile.specializations[0].user_spec_id);
        }
        if (!profile.specializations.length) {
          this.addSkillForm.controls.userSpecId.setValue(null);
          this.addSkillForm.controls.skillId.setValue(null);
        }
        this.isProfileLoading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить профиль.');
        this.isProfileLoading.set(false);
      },
    });
  }

  loadMyPosts(): void {
    this.isPostsLoading.set(true);
    this.http.get<ProfilePost[]>(`${API_BASE_URL}${API_ENDPOINTS.usersMePosts}`).subscribe({
      next: (posts) => {
        this.myPosts.set(posts);
        this.isPostsLoading.set(false);
      },
      error: () => {
        this.actionError.set('Не удалось загрузить ваши посты.');
        this.isPostsLoading.set(false);
      },
    });
  }

  loadCatalogs(): void {
    this.isCatalogsLoading.set(true);

    this.http.get<CatalogSpecialization[]>(`${API_BASE_URL}${API_ENDPOINTS.specializations}`).subscribe({
      next: (specializations) => {
        this.specializationsCatalog.set(specializations);
      },
      error: () => {
        this.actionError.set('Не удалось загрузить список специализаций.');
      },
    });

    this.http.get<CatalogSkill[]>(`${API_BASE_URL}${API_ENDPOINTS.skills}`).subscribe({
      next: (skills) => {
        this.skillsCatalog.set(skills);
        this.isCatalogsLoading.set(false);
      },
      error: () => {
        this.actionError.set('Не удалось загрузить список навыков.');
        this.isCatalogsLoading.set(false);
      },
    });
  }

  onSpecializationSearch(value: string): void {
    this.specializationSearch.set(value);
  }

  onSkillSearch(value: string): void {
    this.skillSearch.set(value);

    const filteredSkills = this.getFilteredSkills();
    const selectedSkillId = this.addSkillForm.controls.skillId.getRawValue();
    if (filteredSkills.length && !filteredSkills.some((skill) => skill.id === selectedSkillId)) {
      this.addSkillForm.controls.skillId.setValue(filteredSkills[0].id);
    }
  }

  onEditSkillSearch(value: string): void {
    this.editSkillSearch.set(value);

    const filteredSkills = this.getFilteredEditSkills();
    const selectedSkillId = this.editSkillForm.controls.skillId.getRawValue();
    if (filteredSkills.length && !filteredSkills.some((skill) => skill.id === selectedSkillId)) {
      this.editSkillForm.controls.skillId.setValue(filteredSkills[0].id);
    }
  }

  onUserSpecializationChange(userSpecId: number): void {
    this.addSkillForm.controls.userSpecId.setValue(userSpecId);
    this.skillSearch.set('');

    const filteredSkills = this.getFilteredSkills();
    const selectedSkillId = this.addSkillForm.controls.skillId.getRawValue();
    if (filteredSkills.length && !filteredSkills.some((skill) => skill.id === selectedSkillId)) {
      this.addSkillForm.controls.skillId.setValue(filteredSkills[0].id);
    }
  }

  toggleSpecializationDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isSpecializationDropdownOpen.set(!this.isSpecializationDropdownOpen());
    if (this.isSpecializationDropdownOpen()) {
      this.isSkillDropdownOpen.set(false);
    }
  }

  toggleSkillDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isSkillDropdownOpen.set(!this.isSkillDropdownOpen());
    if (this.isSkillDropdownOpen()) {
      this.isSpecializationDropdownOpen.set(false);
    }
  }

  toggleEditSkillDropdown(event?: Event): void {
    event?.stopPropagation();
    this.isEditSkillDropdownOpen.set(!this.isEditSkillDropdownOpen());
    if (this.isEditSkillDropdownOpen()) {
      this.isSpecializationDropdownOpen.set(false);
      this.isSkillDropdownOpen.set(false);
    }
  }

  selectSpecialization(specializationId: number, event?: Event): void {
    event?.stopPropagation();
    this.addSpecializationForm.controls.specializationId.setValue(specializationId);
    this.isSpecializationDropdownOpen.set(false);
  }

  selectSkill(skillId: number, event?: Event): void {
    event?.stopPropagation();
    this.addSkillForm.controls.skillId.setValue(skillId);
    this.isSkillDropdownOpen.set(false);
  }

  selectEditSkill(skillId: number, event?: Event): void {
    event?.stopPropagation();
    this.editSkillForm.controls.skillId.setValue(skillId);
    this.isEditSkillDropdownOpen.set(false);
  }

  getSelectedSpecializationName(): string {
    const selectedId = this.addSpecializationForm.controls.specializationId.getRawValue();
    return this.specializationsCatalog().find((item) => item.id === selectedId)?.name ?? '';
  }

  getSelectedSkillName(): string {
    const selectedId = this.addSkillForm.controls.skillId.getRawValue();
    return this.skillsCatalog().find((item) => item.id === selectedId)?.name ?? '';
  }

  getSelectedEditSkillName(): string {
    const selectedId = this.editSkillForm.controls.skillId.getRawValue();
    return this.skillsCatalog().find((item) => item.id === selectedId)?.name ?? '';
  }

  updateContacts(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    if (this.contactEditForm.invalid) {
      this.contactEditForm.markAllAsTouched();
      return;
    }

    const formValue = this.contactEditForm.getRawValue();
    this.isSaving.set(true);
    this.http
      .patch<ProfileResponse>(`${API_BASE_URL}${API_ENDPOINTS.usersMe}`, {
        telegram: this.normalizeNullableString(formValue.telegram),
        phone_number: this.normalizeNullableString(formValue.phoneNumber),
      })
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.contactEditForm.setValue({
            telegram: profile.telegram,
            phoneNumber: profile.phone_number,
          });
          this.actionSuccess.set('Контакты обновлены.');
          this.isSaving.set(false);
          this.closeModal();
        },
        error: () => {
          this.actionError.set('Не удалось обновить контакты.');
          this.isSaving.set(false);
        },
      });
  }

  addSpecialization(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    if (this.addSpecializationForm.invalid) {
      this.addSpecializationForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.addSpecializationForm.getRawValue();
    this.http
      .post(`${API_BASE_URL}${API_ENDPOINTS.usersMeAddSpecialization}`, {
        specialization_id: formValue.specializationId,
        level: formValue.level,
      })
      .subscribe({
        next: () => {
          this.actionSuccess.set('Специализация добавлена.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadProfile();
        },
        error: () => {
          this.actionError.set('Не удалось добавить специализацию.');
          this.isSaving.set(false);
        },
      });
  }

  addSkill(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    if (this.addSkillForm.invalid) {
      this.addSkillForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.addSkillForm.getRawValue();
    this.http
      .post(`${API_BASE_URL}${API_ENDPOINTS.usersMeAddSkill}`, {
        user_spec_id: formValue.userSpecId,
        skill_id: formValue.skillId,
        level: formValue.level,
      })
      .subscribe({
        next: () => {
          this.actionSuccess.set('Навык добавлен.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadProfile();
        },
        error: () => {
          this.actionError.set('Не удалось добавить навык.');
          this.isSaving.set(false);
        },
      });
  }

  updateSpecializationLevel(userSpecId: number, level: number): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    if (!Number.isInteger(level) || level < 1 || level > 10) {
      this.actionError.set('Уровень специализации должен быть от 1 до 10.');
      return;
    }

    this.isSaving.set(true);
    this.http
      .patch(`${API_BASE_URL}${API_ENDPOINTS.usersMeChangeSpecialization}${userSpecId}/`, {
        level,
      })
      .subscribe({
        next: () => {
          this.actionSuccess.set('Уровень специализации обновлен.');
          this.isSaving.set(false);
          this.loadProfile();
        },
        error: () => {
          this.actionError.set('Не удалось обновить специализацию.');
          this.isSaving.set(false);
        },
      });
  }

  deleteSpecialization(userSpecId: number): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.isSaving.set(true);
    this.http.delete(`${API_BASE_URL}${API_ENDPOINTS.usersMeChangeSpecialization}${userSpecId}/`).subscribe({
      next: () => {
        this.actionSuccess.set('Специализация удалена.');
        this.isSaving.set(false);
        this.loadProfile();
      },
      error: () => {
        this.actionError.set('Не удалось удалить специализацию.');
        this.isSaving.set(false);
      },
    });
  }

  updateSkillLevel(userSkillId: number, level: number): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    if (!Number.isInteger(level) || level < 1 || level > 10) {
      this.actionError.set('Уровень навыка должен быть от 1 до 10.');
      return;
    }

    this.isSaving.set(true);
    this.http
      .patch(`${API_BASE_URL}${API_ENDPOINTS.usersMeChangeSkill}${userSkillId}/`, {
        level,
      })
      .subscribe({
        next: () => {
          this.actionSuccess.set('Уровень навыка обновлен.');
          this.isSaving.set(false);
          this.loadProfile();
        },
        error: () => {
          this.actionError.set('Не удалось обновить навык.');
          this.isSaving.set(false);
        },
      });
  }

  deleteSkill(userSkillId: number): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.isSaving.set(true);
    this.http.delete(`${API_BASE_URL}${API_ENDPOINTS.usersMeChangeSkill}${userSkillId}/`).subscribe({
      next: () => {
        this.actionSuccess.set('Навык удален.');
        this.isSaving.set(false);
        this.loadProfile();
      },
      error: () => {
        this.actionError.set('Не удалось удалить навык.');
        this.isSaving.set(false);
      },
    });
  }

  startEditPost(post: ProfilePost): void {
    this.editingPostId.set(post.id);
    this.postEditForm.setValue({
      description: post.description,
      contactLink: post.contact_link,
      skillIds: post.skills_required.map((skill) => skill.id).join(', '),
    });
  }

  cancelEditPost(): void {
    this.editingPostId.set(null);
    this.postEditForm.reset({
      description: '',
      contactLink: '',
      skillIds: '',
    });
  }

  updatePost(postId: number): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    if (this.postEditForm.invalid) {
      this.postEditForm.markAllAsTouched();
      return;
    }

    const skillIds = this.parseSkillIds(this.postEditForm.controls.skillIds.getRawValue());
    if (!skillIds.length) {
      this.postEditForm.controls.skillIds.setErrors({ invalidIds: true });
      this.postEditForm.controls.skillIds.markAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.http
      .patch(`${API_BASE_URL}${API_ENDPOINTS.posts}${postId}`, {
        description: this.postEditForm.controls.description.getRawValue().trim(),
        contact_link: this.postEditForm.controls.contactLink.getRawValue().trim(),
        skills_required: skillIds,
      })
      .subscribe({
        next: () => {
          this.actionSuccess.set('Пост обновлен.');
          this.isSaving.set(false);
          this.cancelEditPost();
          this.loadMyPosts();
        },
        error: () => {
          this.actionError.set('Не удалось обновить пост.');
          this.isSaving.set(false);
        },
      });
  }

  deletePost(postId: number): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);

    this.isSaving.set(true);
    this.http.delete(`${API_BASE_URL}${API_ENDPOINTS.posts}${postId}`).subscribe({
      next: () => {
        this.actionSuccess.set('Пост удален.');
        this.isSaving.set(false);
        this.loadMyPosts();
      },
      error: () => {
        this.actionError.set('Не удалось удалить пост.');
        this.isSaving.set(false);
      },
    });
  }

  getSkillNames(post: ProfilePost): string {
    if (!post.skills_required.length) {
      return 'Нет';
    }

    return post.skills_required.map((skill) => skill.name).join(', ');
  }

  getFilteredSkills(): CatalogSkill[] {
    const selectedUserSpecId = this.addSkillForm.controls.userSpecId.getRawValue();
    const searchTerm = this.skillSearch().trim().toLowerCase();
    const profile = this.profile();
    const selectedUserSpecialization = profile?.specializations.find((spec) => spec.user_spec_id === selectedUserSpecId);
    const selectedSpecId = selectedUserSpecialization?.spec_id;

    if (!selectedSpecId) {
      return [];
    }

    return this.skillsCatalog().filter((skill) => {
      const specializationMatches = skill.specialization === selectedSpecId;
      const searchMatches = searchTerm ? skill.name.toLowerCase().includes(searchTerm) : true;
      return specializationMatches && searchMatches;
    });
  }

  getFilteredEditSkills(): CatalogSkill[] {
    const selectedUserSpecId = this.editSkillForm.controls.userSpecId.getRawValue();
    const searchTerm = this.editSkillSearch().trim().toLowerCase();
    const profile = this.profile();
    const selectedUserSpecialization = profile?.specializations.find((spec) => spec.user_spec_id === selectedUserSpecId);
    const selectedSpecId = selectedUserSpecialization?.spec_id;

    if (!selectedSpecId) {
      return [];
    }

    return this.skillsCatalog().filter((skill) => {
      const specializationMatches = skill.specialization === selectedSpecId;
      const searchMatches = searchTerm ? skill.name.toLowerCase().includes(searchTerm) : true;
      return specializationMatches && searchMatches;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.search-dropdown')) {
      this.isSpecializationDropdownOpen.set(false);
      this.isSkillDropdownOpen.set(false);
      this.isEditSkillDropdownOpen.set(false);
    }
  }

  openAddSpecializationModal(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.addSpecializationForm.reset({ specializationId: null, level: null });
    this.activeModal.set('add-specialization');
  }

  openEditContactsModal(): void {
    const profile = this.profile();
    if (!profile) {
      return;
    }

    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.contactEditForm.setValue({
      telegram: profile.telegram,
      phoneNumber: profile.phone_number,
    });
    this.activeModal.set('edit-contacts');
  }

  openAddSkillModal(): void {
    const profile = this.profile();
    if (!profile?.specializations.length) {
      this.actionError.set('Сначала добавьте хотя бы одну специализацию.');
      return;
    }

    const selectedUserSpecId = this.addSkillForm.controls.userSpecId.getRawValue();
    if (!selectedUserSpecId) {
      this.addSkillForm.controls.userSpecId.setValue(profile.specializations[0].user_spec_id);
      this.onUserSpecializationChange(profile.specializations[0].user_spec_id);
    }

    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.addSkillForm.controls.level.setValue(null);
    this.addSkillForm.controls.skillId.setValue(null);
    this.activeModal.set('add-skill');
  }

  openEditSpecializationLevelModal(userSpecId: number, level: number): void {
    this.editingSpecializationId.set(userSpecId);
    this.editingSkillId.set(null);
    this.editLevelForm.controls.level.setValue(level);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.activeModal.set('edit-specialization-level');
  }

  openEditSkillLevelModal(userSkillId: number, level: number): void {
    this.editingSkillId.set(userSkillId);
    this.editingSpecializationId.set(null);
    this.editLevelForm.controls.level.setValue(level);
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.activeModal.set('edit-skill-level');
  }

  openEditSkillModal(userSkillId: number, userSpecId: number, currentSkillId: number, currentLevel: number): void {
    this.editingSkillId.set(userSkillId);
    this.editingSkillCurrentSkillId.set(currentSkillId);
    this.editSkillSearch.set('');
    this.editSkillForm.setValue({
      userSpecId,
      skillId: currentSkillId,
      level: currentLevel,
    });
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.activeModal.set('edit-skill');
  }

  closeModal(): void {
    this.activeModal.set(null);
    this.editingSpecializationId.set(null);
    this.editingSkillId.set(null);
    this.editingSkillCurrentSkillId.set(null);
    this.editLevelForm.reset({ level: null });
    this.editSkillForm.reset({ userSpecId: null, skillId: null, level: null });
    this.isSpecializationDropdownOpen.set(false);
    this.isSkillDropdownOpen.set(false);
    this.isEditSkillDropdownOpen.set(false);
  }

  submitAddSpecializationModal(): void {
    if (this.addSpecializationForm.invalid) {
      this.addSpecializationForm.markAllAsTouched();
      return;
    }

    this.addSpecialization();
  }

  submitEditContactsModal(): void {
    if (this.contactEditForm.invalid) {
      this.contactEditForm.markAllAsTouched();
      return;
    }

    this.updateContacts();
  }

  submitAddSkillModal(): void {
    if (this.addSkillForm.invalid) {
      this.addSkillForm.markAllAsTouched();
      return;
    }

    if (!this.getFilteredSkills().length) {
      this.actionError.set('Навык для выбранной специализации не найден.');
      return;
    }

    this.addSkill();
  }

  submitEditLevel(): void {
    if (this.editLevelForm.invalid) {
      this.editLevelForm.markAllAsTouched();
      return;
    }

    const level = this.editLevelForm.controls.level.getRawValue();
    if (!level) {
      return;
    }

    if (this.activeModal() === 'edit-specialization-level') {
      const userSpecId = this.editingSpecializationId();
      if (!userSpecId) {
        return;
      }

      this.updateSpecializationLevel(userSpecId, level);
      this.closeModal();
      return;
    }

    if (this.activeModal() === 'edit-skill-level') {
      const userSkillId = this.editingSkillId();
      if (!userSkillId) {
        return;
      }

      this.updateSkillLevel(userSkillId, level);
      this.closeModal();
    }
  }

  submitEditSkillModal(): void {
    if (this.editSkillForm.invalid) {
      this.editSkillForm.markAllAsTouched();
      return;
    }

    const userSkillId = this.editingSkillId();
    const currentSkillId = this.editingSkillCurrentSkillId();
    const formValue = this.editSkillForm.getRawValue();

    if (!userSkillId || !currentSkillId || !formValue.userSpecId || !formValue.skillId || !formValue.level) {
      return;
    }

    if (formValue.skillId === currentSkillId) {
      this.updateSkillLevel(userSkillId, formValue.level);
      this.closeModal();
      return;
    }

    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.isSaving.set(true);

    this.http
      .post(`${API_BASE_URL}${API_ENDPOINTS.usersMeAddSkill}`, {
        user_spec_id: formValue.userSpecId,
        skill_id: formValue.skillId,
        level: formValue.level,
      })
      .subscribe({
        next: () => {
          this.http.delete(`${API_BASE_URL}${API_ENDPOINTS.usersMeChangeSkill}${userSkillId}/`).subscribe({
            next: () => {
              this.actionSuccess.set('Навык обновлен.');
              this.isSaving.set(false);
              this.closeModal();
              this.loadProfile();
            },
            error: () => {
              this.actionError.set('Новый навык добавлен, но старый не удалился. Удалите старый вручную.');
              this.isSaving.set(false);
              this.closeModal();
              this.loadProfile();
            },
          });
        },
        error: () => {
          this.actionError.set('Не удалось обновить навык.');
          this.isSaving.set(false);
        },
      });
  }

  private parseSkillIds(rawValue: string): number[] {
    return [...new Set(
      rawValue
        .split(',')
        .map((value) => Number(value.trim()))
        .filter((value) => Number.isInteger(value) && value > 0),
    )];
  }

  private normalizeNullableString(value: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}
