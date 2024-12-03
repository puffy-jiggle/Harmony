// src/__tests__/backend/controllers.test.ts
import { Request, Response, NextFunction } from 'express';
import audioController from '../../server/controller/audioController';

describe('Audio Controller', () => {
  it('upload controller exists', () => {
    expect(audioController.upload).toBeDefined();
  });
});

//src/__tests__/backend/controllers.test.ts