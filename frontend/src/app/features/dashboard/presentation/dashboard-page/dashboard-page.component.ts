import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';

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

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
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
}
