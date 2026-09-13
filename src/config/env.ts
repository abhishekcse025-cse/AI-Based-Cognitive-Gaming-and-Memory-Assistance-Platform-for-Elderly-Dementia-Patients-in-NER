// Configuration with environment variable fallback and runtime override capability
export interface AppConfig {
  apiBaseUrl: string;
  useMockApi: boolean;
}

const DEFAULT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000';
const DEFAULT_USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK_API !== 'false';

// Runtime configuration object (can be updated in Caregiver Dashboard for quick field tests)
export const configState: AppConfig = {
  apiBaseUrl: DEFAULT_API_BASE_URL,
  useMockApi: DEFAULT_USE_MOCK,
};

export function getApiBaseUrl(): string {
  return configState.apiBaseUrl;
}

export function setApiBaseUrl(url: string): void {
  configState.apiBaseUrl = url.trim();
  console.log('[Config] API_BASE_URL updated to:', configState.apiBaseUrl);
}

export function isUsingMockApi(): boolean {
  return configState.useMockApi;
}

export function setUseMockApi(useMock: boolean): void {
  configState.useMockApi = useMock;
  console.log('[Config] USE_MOCK_API updated to:', configState.useMockApi);
}
