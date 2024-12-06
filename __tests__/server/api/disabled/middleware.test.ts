// src/__tests__/server/api/middleware.test.ts
import { Request, Response, NextFunction } from 'express';
import testMiddleware from '../../controller/audioMiddleware';

// 1. Basic unit tests for middleware functions
// 2. Tests error handling and basic functionality
// 3. Mocks request/response objects to simulate Express middleware

describe('Middleware Tests', () => {
  // Setup mock objects before each test
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    // Reset Mocks before each test
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  // Test 1 basic middleware functionality
  describe('testFunction', () => {
    it('calls next function', async () => {
      await testMiddleware.testFunction(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  // Test 2 error handling for missing user_id
  describe('getUserAudio', () => {
    it('returns 400 for missing user_id', async () => {
      mockRequest.params = {};

      await testMiddleware.getUserAudio(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Missing user_id in request params'
      });
    });
  });
});