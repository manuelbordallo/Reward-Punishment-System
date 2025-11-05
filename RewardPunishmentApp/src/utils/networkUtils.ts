// Note: We avoid importing store directly to prevent circular dependencies
// Error handling will be done at the component level

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: any): ApiError => {
  // Handle different types of errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    // Network error
    const networkError = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
    return {
      message: networkError,
      code: 'NETWORK_ERROR',
    };
  }

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    let message = 'Error del servidor';

    switch (status) {
      case 400:
        message = 'Datos inválidos enviados al servidor';
        break;
      case 401:
        message = 'No autorizado para realizar esta acción';
        break;
      case 403:
        message = 'Acceso prohibido';
        break;
      case 404:
        message = 'Recurso no encontrado';
        break;
      case 500:
        message = 'Error interno del servidor';
        break;
      case 503:
        message = 'Servicio no disponible temporalmente';
        break;
      default:
        message = `Error del servidor (${status})`;
    }

    if (error.response.data?.message) {
      message = error.response.data.message;
    }

    return {
      message,
      status,
      code: 'SERVER_ERROR',
    };
  }

  // Generic error
  const genericMessage = error.message || 'Ha ocurrido un error inesperado';
  return {
    message: genericMessage,
    code: 'GENERIC_ERROR',
  };
};

export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  loadingMessage?: string
): Promise<T | null> => {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    // Just throw the error, let the calling code handle it
    throw error;
  }
};

export const isNetworkError = (error: any): boolean => {
  return (
    error.name === 'TypeError' ||
    error.message?.includes('Network') ||
    error.message?.includes('fetch') ||
    !navigator.onLine
  );
};

export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries || !isNetworkError(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  return null;
};