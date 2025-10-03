/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseModel {
  chat(prompt: string, options?: Record<string, any>): Promise<any>;
}
