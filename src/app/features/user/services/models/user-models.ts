export interface CreateUserRequest {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface UserProps extends CreateUserRequest {
  createdAt: Date;
}

export interface UserResponse {
  user: Omit<UserProps, 'password'>;
}
