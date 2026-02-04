export interface ApiFieldInfo {
  path: string;
  type: string;
  sampleValue: unknown;
}

export interface ApiTestResult {
  success: boolean;
  fields?: ApiFieldInfo[];
  error?: string;
}
