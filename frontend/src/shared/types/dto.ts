export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshDto {
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface CreateTeamDto {
  name: string;
  tag: string;
}

export interface JoinByInviteCodeDto {
  inviteCode: string;
}

export interface RegisterDto {
    email: string; 
    password: string; 
    username : string; 
}