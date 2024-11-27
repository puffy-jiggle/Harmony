// All types for server files 

// Custom Error Type 
export type CustomError = {
  log: string,
  status: number,
  message: string | {err: string}
};