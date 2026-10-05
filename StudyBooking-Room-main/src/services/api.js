import { Platform } from 'react-native';

const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

export async function apiRequest(path, { token, method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body == null ? undefined : JSON.stringify(body)
    });
  } catch {
    const error = new Error('Không thể kết nối hệ thống. Vui lòng kiểm tra kết nối và thử lại.');
    error.status = 0;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Yêu cầu thất bại.');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

export function queryString(values) {
  const params = Object.entries(values)
    .filter(([, value]) => value !== '' && value != null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  return params.length ? `?${params.join('&')}` : '';
}
