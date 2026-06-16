export class ApiConfig {
  static get BASE_URL() {
    return 'http://localhost:8080';
  }
  static get ENDPOINTS() {
    return {
      LOGIN: '/api/v1/users/login',
      SIGNUP: '/api/v1/users/signup',
      GET_USER: '/api/v1/users',
      UPDATE_USER: '/api/v1/users',
      CHANGE_PASSWORD: '/api/v1/users',
      ACTIVATE_USER: '/api/v1/users',
      DEACTIVATE_USER: '/api/v1/users',
      DELETE_USER: '/api/v1/users',
      UPLOAD_PROFILE_IMAGE: '/api/v1/users',
      GET_PROFILE_IMAGE: '/api/v1/users',
      GET_USERS: '/api/v1/users/users',
      CREATE_CONVERSATION: '/api/v1/conversation',
      GET_CONVERSATION: '/api/v1/conversation/get',
      USER_CONVERSATIONS: '/api/v1/conversation/user',
      GET_MESSAGES: '/api/v1/messages',
      PRESENCE: '/api/v1/presence',
      POSTS: '/api/v1/posts',
    };
  }
}
