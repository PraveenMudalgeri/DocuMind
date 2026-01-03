/**
 * Visualization Service
 * 
 * Handles all database visualization API calls.
 * Database-agnostic - works with any SQL database connection.
 */

import api from './api';

const BASE_PATH = '/api/visualization';

export const visualizationService = {
    /**
     * Get comprehensive visualization metadata for a connected database.
     * 
     * Returns:
     * - Table metadata (schema, columns, data types)
     * - Row counts per table
     * - Statistical summaries for numeric columns
     * - Auto-generated chart configurations (rule-based)
     * 
     * @param {string} connectionId - Active database connection ID
     * @param {boolean} includeStatistics - Whether to compute statistics (default: true)
     * @param {number} maxTables - Optional limit on number of tables to analyze
     * @returns {Promise<Object>} Visualization metadata response
     */
    async getVisualizationMetadata(connectionId, includeStatistics = true, maxTables = null) {
        const response = await api.post(`${BASE_PATH}/metadata`, {
            connection_id: connectionId,
            include_statistics: includeStatistics,
            max_tables: maxTables
        });
        return response.data;
    },

    /**
     * Generate a custom visualization based on user-specified parameters.
     * 
     * User can select:
     * - Table to query
     * - Dimension column for grouping (optional)
     * - Metric column to aggregate
     * - Aggregation function (count, sum, avg, min, max)
     * - Chart type (bar, line, pie)
     * - Sort order and limit
     * 
     * @param {Object} params - Visualization parameters
     * @param {string} params.connectionId - Active database connection ID
     * @param {string} params.tableName - Table to query
     * @param {string} params.chartType - Chart type: 'bar', 'line', or 'pie'
     * @param {string} params.dimensionColumn - Column for grouping/x-axis (optional)
     * @param {string} params.metricColumn - Column to aggregate
     * @param {string} params.aggregation - Aggregation function (default: 'count')
     * @param {number} params.limit - Max data points (default: 20)
     * @param {string} params.orderBy - Sort order: 'asc' or 'desc' (default: 'desc')
     * @returns {Promise<Object>} Custom visualization response with chart config
     */
    async generateCustomVisualization({
        connectionId,
        tableName,
        chartType,
        dimensionColumn = null,
        metricColumn,
        aggregation = 'count',
        limit = 20,
        orderBy = 'desc'
    }) {
        const response = await api.post(`${BASE_PATH}/custom`, {
            connection_id: connectionId,
            table_name: tableName,
            chart_type: chartType,
            dimension_column: dimensionColumn,
            metric_column: metricColumn,
            aggregation: aggregation,
            limit: limit,
            order_by: orderBy
        });
        return response.data;
    },

    /**
     * Health check for visualization service
     * @returns {Promise<Object>} Health status
     */
    async getHealth() {
        const response = await api.get(`${BASE_PATH}/health`);
        return response.data;
    }
};

export default visualizationService;
