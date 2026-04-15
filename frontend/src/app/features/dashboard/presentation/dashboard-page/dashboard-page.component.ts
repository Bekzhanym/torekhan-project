import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';

import { PostFormComponent, PostFormValue } from '../post-form/post-form.component';
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
  imports: [CommonModule, PostFormComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
})
export class DashboardPageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly posts = signal<Post[]>([]);
  readonly loading = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly actionSuccess = signal<string | null>(null);

  readonly showForm = signal(false);
  readonly formMode = signal<'create' | 'edit'>('create');
  readonly editedPostId = signal<number | null>(null);
  readonly editedInitialValue = signal<PostFormValue | null>(null);

  ngOnInit(): void {
    this.loadPosts();
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
}
