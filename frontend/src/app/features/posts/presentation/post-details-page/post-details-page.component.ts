import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApplyFormComponent, ApplyFormValue } from '../../../dashboard/presentation/apply-form/apply-form.component';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../shared/constants/api.constants';

interface Skill {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface Post {
  id: number;
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
  selector: 'app-post-details-page',
  imports: [CommonModule, RouterLink, ApplyFormComponent],
  templateUrl: './post-details-page.component.html',
  styleUrl: './post-details-page.component.css',
})
export class PostDetailsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);
  readonly post = signal<Post | null>(null);
  readonly showApplyForm = signal(false);
  readonly backRoute = signal('/dashboard');
  readonly backLabel = signal('← Назад к постам');

  ngOnInit(): void {
    const from = this.route.snapshot.queryParamMap.get('from');
    if (from === 'profile') {
      this.backRoute.set('/profile');
      this.backLabel.set('← Назад в профиль');
    }

    const postId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(postId) || postId <= 0) {
      this.error.set('Некорректный ID поста.');
      this.loading.set(false);
      return;
    }

    this.http.get<Post[]>(`${API_BASE_URL}${API_ENDPOINTS.posts}`).subscribe({
      next: (posts) => {
        const targetPost = posts.find((item) => item.id === postId) ?? null;
        if (!targetPost) {
          this.error.set('Пост не найден.');
        } else {
          this.post.set(targetPost);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить пост.');
        this.loading.set(false);
      },
    });
  }

  openApplyForm(): void {
    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.showApplyForm.set(true);
  }

  closeApplyForm(): void {
    if (this.isSaving()) {
      return;
    }
    this.showApplyForm.set(false);
  }

  applyToPost(value: ApplyFormValue): void {
    const currentPost = this.post();
    if (!currentPost) {
      this.actionError.set('Пост не найден.');
      return;
    }

    this.actionError.set(null);
    this.actionSuccess.set(null);
    this.isSaving.set(true);

    const payload: ApplicationCreatePayload = {
      post: currentPost.id,
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
