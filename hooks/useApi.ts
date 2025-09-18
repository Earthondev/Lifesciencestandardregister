import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import { ApiResponse } from '@/types'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export const useApi = <T>() => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await apiCall()
      
      if (response.success) {
        setState(prev => ({ 
          ...prev, 
          data: response.data || null, 
          loading: false 
        }))
      } else {
        setState(prev => ({ 
          ...prev, 
          error: response.error || 'Unknown error', 
          loading: false 
        }))
      }
      
      return response
    } catch (error: any) {
      const errorMessage = error.message || 'Network error'
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }))
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

// Specific hooks for common API calls
export const useStatistics = () => {
  const api = useApi()
  
  const fetchStatistics = useCallback(async () => {
    return api.execute(() => apiClient.getStatistics())
  }, [api])
  
  return {
    ...api,
    fetchStatistics
  }
}

export const useStandards = () => {
  const api = useApi()
  
  const fetchStandards = useCallback(async () => {
    return api.execute(() => apiClient.getStandards())
  }, [api])
  
  const registerStandard = useCallback(async (data: any) => {
    return api.execute(() => apiClient.registerStandard(data))
  }, [api])
  
  return {
    ...api,
    fetchStandards,
    registerStandard
  }
}

export const useRecentActivity = () => {
  const api = useApi()
  
  const fetchRecentActivity = useCallback(async (limit = 10) => {
    return api.execute(() => apiClient.getRecentActivity(limit))
  }, [api])
  
  return {
    ...api,
    fetchRecentActivity
  }
}
