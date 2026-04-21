import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { PostFormComponent, PostFormValue, SkillOption } from '../post-form/post-form.component';
import { ApplyFormComponent, ApplyFormValue } from '../apply-form/apply-form.component';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../shared/constants/api.constants';

interface Skill {
  id: number;
  name: string;
  specialization?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Post {
  id: number;
  title: string;
  author: User;
  description: string;
  skills_required: Skill[];
  created_at: string;
  contact_link: string;
}

interface ApplicationCreatePayload {
  post: number;
  description: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, FormsModule, PostFormComponent, ApplyFormComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly skills = signal<SkillOption[]>([]);
  readonly skillsLoading = signal(false);
  readonly skillsError = signal<string | null>(null);

  readonly showForm = signal(false);
  readonly formMode = signal<'create' | 'edit'>('create');
  readonly editedPostId = signal<number | null>(null);
  readonly editedInitialValue = signal<PostFormValue | null>(null);
  readonly showApplyForm = signal(false);
  readonly applyPostId = signal<number | null>(null);

  searchQuery = '';
  readonly isSearching = signal(false);

  ngOnInit(): void {
    this.loadSkills();
    this.loadPosts();
  }

  search(): void {
    const trimmed = this.searchQuery.trim();
    if (!trimmed) {
      this.loadPosts();
      return;
    }
    this.isSearching.set(true);
    this.loading.set(true);
    this.error.set(null);

    this.http
      .get<Post[]>(`${API_BASE_URL}${API_ENDPOINTS.postsSearch}${encodeURIComponent(trimmed)}`)
      .subscribe({
        next: (result) => {
          this.posts.set(result);
          this.loading.set(false);
          this.isSearching.set(false);
        },
        error: () => {
          this.error.set('Ошибка при поиске постов.');
          this.loading.set(false);
          this.isSearching.set(false);
        },
      });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadPosts();
  }

  loadSkills(): void {
    this.skillsLoading.set(true);
    this.skillsError.set(null);

    this.http.get<Skill[]>(`${API_BASE_URL}${API_ENDPOINTS.skills}`).subscribe({
      next: (response) => {
        this.skills.set(
          response
            .map((skill) => ({
              id: skill.id,
              name: skill.name,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        );
        this.skillsLoading.set(false);
      },
      error: () => {
        this.skillsError.set('Не удалось загрузить список навыков.');
        this.skillsLoading.set(false);
      },
    });
  }

  loadPosts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.http.get<Post[]>(`${API_BASE_URL}${API_ENDPOINTS.posts}`).subscribe({
      next: (response) => {
        this.posts.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load posts.');
        this.loading.set(false);
      },
    });
  }

  openCreateForm(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.formMode.set('create');
    this.editedPostId.set(null);
    this.editedInitialValue.set(null);
    this.showForm.set(true);
  }

  openEditForm(post: Post): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.formMode.set('edit');
    this.editedPostId.set(post.id);
    this.editedInitialValue.set({
      title: post.title,
      description: post.description,
      contact_link: post.contact_link,
      skills_required: post.skills_required.map((skill) => skill.id),
    });
    this.showForm.set(true);
  }

  closeForm(): void {
    if (this.isSaving()) {
      return;
    }

    this.showForm.set(false);
    this.editedPostId.set(null);
    this.editedInitialValue.set(null);
  }

  openApplyForm(postId: number): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.applyPostId.set(postId);
    this.showApplyForm.set(true);
  }

  closeApplyForm(): void {
    if (this.isSaving()) {
      return;
    }

    this.showApplyForm.set(false);
    this.applyPostId.set(null);
  }

  submitPostForm(value: PostFormValue): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.isSaving.set(true);

    if (this.formMode() === 'create') {
      this.http.post(`${API_BASE_URL}${API_ENDPOINTS.postsAdd}`, value).subscribe({
        next: () => {
          this.actionSuccess.set('Post created.');
          this.isSaving.set(false);
          this.closeForm();
          this.loadPosts();
        },
        error: () => {
          this.actionError.set('Failed to create post.');
          this.isSaving.set(false);
        },
      });
      return;
    }

    const postId = this.editedPostId();
    if (!postId) {
      this.actionError.set('Missing post id for update.');
      this.isSaving.set(false);
      return;
    }

    this.http.patch(`${API_BASE_URL}${API_ENDPOINTS.posts}${postId}`, value).subscribe({
      next: () => {
        this.actionSuccess.set('Post updated.');
        this.isSaving.set(false);
        this.closeForm();
        this.loadPosts();
      },
      error: () => {
        this.actionError.set('Failed to update post.');
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
        this.actionSuccess.set('Post deleted.');
        this.isSaving.set(false);
        this.loadPosts();
      },
      error: () => {
        this.actionError.set('Failed to delete post.');
        this.isSaving.set(false);
      },
    });
  }

  openPostDetails(postId: number): void {
    this.router.navigate(['/posts', postId], { queryParams: { from: 'dashboard' } });
  }

  applyToPost(value: ApplyFormValue): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.isSaving.set(true);
    const postId = this.applyPostId();

    if (!postId) {
      this.actionError.set('Не найден пост для заявки.');
      this.isSaving.set(false);
      return;
    }

    const payload: ApplicationCreatePayload = {
      post: postId,
      description: value.description,
    };

    this.http.post(`${API_BASE_URL}${API_ENDPOINTS.applicationAdd}`, payload).subscribe({
      next: () => {
        this.actionSuccess.set('Заявка отправлена.');
        this.isSaving.set(false);
        this.closeApplyForm();
      },
      error: () => {
        this.actionError.set('Не удалось отправить заявку.');
        this.isSaving.set(false);
      },
    });
  }
}
