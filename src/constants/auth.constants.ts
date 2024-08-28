export enum AuthErrorMessage {
  ADMIN_ROLE_ASSIGN_REQUIRED = 'Only administrators can assign the admin role.',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN_RESOURCE = 'Forbidden',
}

export const AuthForbiddenErrorSwagger = {
  status: 403,
  description: 'Forbidden resource for the user role',
  schema: {
    example: {
      message: AuthErrorMessage.FORBIDDEN_RESOURCE,
      error: 'Forbidden',
      statusCode: 403,
    },
  },
};
