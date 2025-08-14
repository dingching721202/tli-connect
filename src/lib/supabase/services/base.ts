import { supabase } from '../client'
import { QueryResult, QueryListResult, PaginationOptions, PaginatedResponse } from '../types'

export abstract class BaseSupabaseService {
  protected client = supabase

  /**
   * Generic method to handle paginated queries
   */
  protected async paginatedQuery<T>(
    query: any,
    options: PaginationOptions
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, orderBy = 'created_at', ascending = false } = options
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Add pagination and ordering
    let paginatedQuery = query
      .range(from, to)
      .order(orderBy, { ascending })

    const [{ data, error, count }, { count: totalCount }] = await Promise.all([
      paginatedQuery.select('*', { count: 'exact' }),
      query.select('*', { count: 'exact', head: true })
    ])

    if (error) {
      throw new Error(`Database query failed: ${error.message}`)
    }

    const total = totalCount || 0
    const totalPages = Math.ceil(total / limit)

    return {
      data: data || [],
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_previous: page > 1
      }
    }
  }

  /**
   * Generic method to handle single record queries
   */
  protected async singleQuery<T>(query: any): Promise<QueryResult<T>> {
    const { data, error } = await query.single()
    
    return {
      data: data || null,
      error: error ? new Error(error.message) : null
    }
  }

  /**
   * Generic method to handle list queries
   */
  protected async listQuery<T>(query: any): Promise<QueryListResult<T>> {
    const { data, error, count } = await query
    
    return {
      data: data || [],
      error: error ? new Error(error.message) : null,
      count
    }
  }

  /**
   * Handle database errors consistently
   */
  protected handleError(error: any, context: string): never {
    console.error(`Database error in ${context}:`, error)
    throw new Error(`${context} failed: ${error.message || 'Unknown error'}`)
  }

  /**
   * Log activities to the activity_logs table
   */
  protected async logActivity(
    userId: string | null,
    activityType: string,
    resourceType: string | null,
    resourceId: string | null,
    description: string,
    metadata?: Record<string, any>,
    campus?: string
  ) {
    try {
      await this.client
        .from('activity_logs')
        .insert({
          user_id: userId,
          activity_type: activityType as any,
          resource_type: resourceType,
          resource_id: resourceId,
          description,
          metadata,
          campus: campus as any
        })
    } catch (error) {
      // Log activity errors shouldn't break the main operation
      console.error('Failed to log activity:', error)
    }
  }
}