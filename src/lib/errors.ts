export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'A database error occurred', code = 'DB_ERROR') {
    super(message, 500, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', code = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}
