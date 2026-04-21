export const API_BASE_URL = 'http://127.0.0.1:8000/';

export const API_ENDPOINTS = {
  login: '/api/token/',
  tokenRefresh: '/api/token/refresh/',
  register: '/api/users/register',
  usersMe: '/api/users/me/',
  usersMeAddSkill: '/api/users/me/add-skill/',
  usersMeAddSpecialization: '/api/users/me/add-specialization/',
  usersMeChangeSkill: '/api/users/me/change-skill/',
  usersMeChangeSpecialization: '/api/users/me/change-specialization/',
  usersMePosts: '/api/users/me/posts',
  skills: '/api/skills/',
  specializations: '/api/specializations/',
  posts: '/api/posts/',
  postsAdd: '/api/posts/add',
  applicationAdd: '/api/application/add',
  services: '/api/services',
  bookings: '/api/bookings',
  reviews: '/api/reviews',
};
