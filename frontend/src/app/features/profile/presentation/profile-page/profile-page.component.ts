import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';

import { API_BASE_URL, API_ENDPOINTS } from '../../../../shared/constants/api.constants';

interface UserSpecialization {
  spec_id: number;
  spec_name: string;
  user_spec_id: number;
  level: string;
  skills: string[];
}

interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  specializations: UserSpecialization[];
}

@Component({
  selector: 'app-profile-page',
  imports: [CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly profile = signal<ProfileResponse | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<ProfileResponse>(`${API_BASE_URL}${API_ENDPOINTS.usersMe}`).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить профиль.');
        this.isLoading.set(false);
      },
    });
  }
}
