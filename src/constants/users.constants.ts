export enum UserRole {
  GUEST = 'guest',
  CUSTOMER = 'customer',
  AGENT = 'agent',
  ADMIN = 'admin',
}

export enum UserErrorMessage {
  USER_DOES_NOT_EXIST = 'User does not exist',
  USER_ALREADY_REGISTERED = 'User already registered',
}

export const USERS_PAGINATION_ITEMS_PER_PAGE = 20;
