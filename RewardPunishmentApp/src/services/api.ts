import { ApiResponse } from '../types';
import { config } from '../utils/config';

const API_BASE_URL = config.API_BASE_URL;

class ApiService {
    private baseUrl: string;
    private healthCheckUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
        // Health check uses the base server URL, not the API path
        this.healthCheckUrl = baseUrl.replace('/api', '');
    }

    private log(message: string, data?: any) {
        if (config.ENABLE_LOGGING) {
            console.log(`[ApiService] ${message}`, data || '');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.TIMEOUT);

        try {
            const url = `${this.baseUrl}${endpoint}`;
            this.log(`Making request to: ${url}`, { method: options.method || 'GET' });

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                signal: controller.signal,
                ...options,
            });

            clearTimeout(timeoutId);

            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                this.log(`Request failed with status ${response.status}`, data);
                return {
                    success: false,
                    error: {
                        code: `HTTP_${response.status}`,
                        message: data?.message || data || 'Request failed',
                        details: data,
                    },
                };
            }

            this.log(`Request successful`, { status: response.status });
            return {
                success: true,
                data,
            };
        } catch (error) {
            clearTimeout(timeoutId);

            let errorMessage = 'Network error occurred';
            let errorCode = 'NETWORK_ERROR';

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    errorMessage = 'Request timeout';
                    errorCode = 'TIMEOUT_ERROR';
                } else if (error.message.includes('fetch')) {
                    errorMessage = 'Unable to connect to server. Please check your internet connection.';
                    errorCode = 'CONNECTION_ERROR';
                } else {
                    errorMessage = error.message;
                }
            }

            this.log(`Request error: ${errorMessage}`, error);
            return {
                success: false,
                error: {
                    code: errorCode,
                    message: errorMessage,
                },
            };
        }
    }

    private async requestWithRetry<T>(
        endpoint: string,
        options: RequestInit = {},
        retries: number = config.RETRY_ATTEMPTS
    ): Promise<ApiResponse<T>> {
        for (let attempt = 1; attempt <= retries; attempt++) {
            const result = await this.request<T>(endpoint, options);

            if (result.success || attempt === retries) {
                return result;
            }

            // Only retry on network errors
            if (result.error?.code === 'CONNECTION_ERROR' || result.error?.code === 'TIMEOUT_ERROR') {
                this.log(`Retrying request (attempt ${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, config.RETRY_DELAY * attempt));
            } else {
                return result;
            }
        }

        return {
            success: false,
            error: {
                code: 'MAX_RETRIES_EXCEEDED',
                message: 'Maximum retry attempts exceeded',
            },
        };
    }

    async testConnection(): Promise<ApiResponse<any>> {
        this.log('Testing connection to server');
        try {
            const response = await fetch(`${this.healthCheckUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.log('Connection test successful', data);
                return {
                    success: true,
                    data,
                };
            } else {
                return {
                    success: false,
                    error: {
                        code: `HTTP_${response.status}`,
                        message: 'Server health check failed',
                    },
                };
            }
        } catch (error) {
            this.log('Connection test failed', error);
            return {
                success: false,
                error: {
                    code: 'CONNECTION_ERROR',
                    message: 'Unable to connect to server',
                },
            };
        }
    }

    async get<T>(endpoint: string, useRetry: boolean = true): Promise<ApiResponse<T>> {
        return useRetry
            ? this.requestWithRetry<T>(endpoint, { method: 'GET' })
            : this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data: any, useRetry: boolean = false): Promise<ApiResponse<T>> {
        const options = {
            method: 'POST',
            body: JSON.stringify(data),
        };
        return useRetry
            ? this.requestWithRetry<T>(endpoint, options)
            : this.request<T>(endpoint, options);
    }

    async put<T>(endpoint: string, data: any, useRetry: boolean = false): Promise<ApiResponse<T>> {
        const options = {
            method: 'PUT',
            body: JSON.stringify(data),
        };
        return useRetry
            ? this.requestWithRetry<T>(endpoint, options)
            : this.request<T>(endpoint, options);
    }

    async delete<T>(endpoint: string, useRetry: boolean = false): Promise<ApiResponse<T>> {
        const options = { method: 'DELETE' };
        return useRetry
            ? this.requestWithRetry<T>(endpoint, options)
            : this.request<T>(endpoint, options);
    }
}

export const apiService = new ApiService();