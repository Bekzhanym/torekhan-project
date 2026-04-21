import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { API_BASE_URL, API_ENDPOINTS } from '../../../../shared/constants/api.constants';

interface ApplicantUser {
  id: number;
  username: string;
  email: string;
  telegram?: string | null;
  phone_number?: string | null;
  role?: string;
  specializations?: unknown[];
}

interface PostApplication {
  user: ApplicantUser;
  post: number;
  description: string;
}

@Component({
  selector: 'app-post-applications-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './post-applications-page.component.html',
  styleUrl: './post-applications-page.component.css',
})
export class PostApplicationsPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly applications = signal<PostApplication[]>([]);
  readonly postId = signal<number | null>(null);

  ngOnInit(): void {
    const postId = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(postId) || postId <= 0) {
      this.error.set('Некорректный ID поста.');
      this.loading.set(false);
      return;
    }

    this.postId.set(postId);
    const endpoint = `${API_BASE_URL}${API_ENDPOINTS.posts}${postId}/applications`;
    this.http.get<PostApplication[]>(endpoint).subscribe({
      next: (response) => {
        this.applications.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить заявки.');
        this.loading.set(false);
      },
    });
  }
}
