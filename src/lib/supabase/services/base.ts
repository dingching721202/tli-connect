import { supabase } from '../client'
import { QueryResult, QueryListResult, PaginationOptions, PaginatedResponse } from '../types'

export abstract class BaseSupabaseService {
  protected client = supabase

  /**
   * Generic method to handle paginated queries
   */
  protected async paginatedQuery<T>(
    query: unknown,
    options: PaginationOptions
  ): Promise<PaginatedResponse<T>> {
    const { page, limit, orderBy = 'created_at', ascending = false } = options
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Add pagination and ordering using type assertions
    const queryObj = query as {
      range: (from: number, to: number) => { order: (field: string, options: { ascending: boolean }) => { select: (fields: string, options?: unknown) => Promise<{ data: T[]; error: unknown }> } };
      select: (fields: string, options?: unknown) => Promise<{ count: number }>;
    };

    const [{ data, error }, { count: totalCount }] = await Promise.all([
      queryObj.range(from, to).order(orderBy, { ascending }).select('*', { count: 'exact' }),
      queryObj.select('*', { count: 'exact', head: true })
    ])

    if (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : String(error)}`)
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
  protected async singleQuery<T>(query: unknown): Promise<QueryResult<T>> {
    const { data, error } = await (query as { single: () => Promise<{ data: T | null; error: unknown }> }).single()
    
    return {
      data: data || null,
      error: error ? new Error(error instanceof Error ? error.message : String(error)) : null
    }
  }

  /**
   * Generic method to handle list queries
   */
  protected async listQuery<T>(query: unknown): Promise<QueryListResult<T>> {
    const { data, error, count } = await (query as Promise<{ data: T[]; error: unknown; count: number }>)
    
    return {
      data: data || [],
      error: error ? new Error(error instanceof Error ? error.message : String(error)) : null,
      count
    }
  }

  /**
   * Handle database errors consistently
   */
  protected handleError(error: unknown, context: string): never {
    console.error(`Database error in ${context}:`, error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`${context} failed: ${message}`)
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
    metadata?: Record<string, unknown>,
    campus?: string
  ) {
    try {
      await this.client
        .from('activity_logs')
        .insert({
          user_id: userId,
          activity_type: activityType,
          resource_type: resourceType,
          resource_id: resourceId,
          description,
          metadata,
          campus: campus
        })
    } catch (error) {
      // Log activity errors shouldn't break the main operation
      console.error('Failed to log activity:', error)
    }
  }
}