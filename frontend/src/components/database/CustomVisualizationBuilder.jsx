/**
 * Custom Visualization Builder Component
 * 
 * Allows users to create custom visualizations by selecting:
 * - Table
 * - Dimension (grouping column)
 * - Metric (column to aggregate)
 * - Aggregation function
 * - Chart type
 */

import { useState } from 'react';
import { Button } from '../common/Button';

export function CustomVisualizationBuilder({
    tables,
    onGenerate,
    isLoading = false
}) {
    const [selectedTable, setSelectedTable] = useState('');
    const [dimensionColumn, setDimensionColumn] = useState('');
    const [metricColumn, setMetricColumn] = useState('');
    const [aggregation, setAggregation] = useState('count');
    const [chartType, setChartType] = useState('bar');

    // Get selected table metadata
    const selectedTableData = tables.find(t => t.table_name === selectedTable);

    // Available columns based on selection
    const availableDimensionColumns = selectedTableData?.columns.filter(
        // For dimension, we can use text or timestamp columns (not IDs)
        col => ['text', 'timestamp', 'boolean'].includes(col.category) && !col.name.toLowerCase().includes('id')
    ) || [];

    const availableMetricColumns = selectedTableData?.columns.filter(
        // For metrics, we need numeric columns
        col => col.category === 'numeric'
    ) || [];

    const handleGenerate = () => {
        if (!selectedTable || !metricColumn) {
            return;
        }

        onGenerate({
            tableName: selectedTable,
            dimensionColumn: dimensionColumn || null,
            metricColumn,
            aggregation,
            chartType,
            limit: 20,
            orderBy: 'desc'
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Custom Visualization</h3>
            
            <div className="space-y-4">
                {/* Table Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Table
                    </label>
                    <select
                        value={selectedTable}
                        onChange={(e) => {
                            setSelectedTable(e.target.value);
                            setDimensionColumn('');
                            setMetricColumn('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Choose a table...</option>
                        {tables.map((table) => (
                            <option key={table.table_name} value={table.table_name}>
                                {table.table_name} ({table.row_count} rows)
                            </option>
                        ))}
                    </select>
                </div>

                {selectedTable && (
                    <>
                        {/* Chart Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chart Type
                            </label>
                            <div className="flex gap-2">
                                {['bar', 'line', 'pie'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setChartType(type)}
                                        className={`px-4 py-2 rounded-md capitalize ${
                                            chartType === type
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dimension Column (optional for grouping) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Group By (Dimension) - Optional
                            </label>
                            <select
                                value={dimensionColumn}
                                onChange={(e) => setDimensionColumn(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">No grouping (single value)</option>
                                {availableDimensionColumns.map((col) => (
                                    <option key={col.name} value={col.name}>
                                        {col.name} ({col.data_type})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Select a column to group data by (e.g., status, category, date)
                            </p>
                        </div>

                        {/* Metric Column */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Metric (Value to Aggregate) *
                            </label>
                            <select
                                value={metricColumn}
                                onChange={(e) => setMetricColumn(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Choose a metric...</option>
                                {availableMetricColumns.map((col) => (
                                    <option key={col.name} value={col.name}>
                                        {col.name} ({col.data_type})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Select a numeric column to aggregate (e.g., price, quantity, amount)
                            </p>
                        </div>

                        {/* Aggregation Function */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Aggregation Function
                            </label>
                            <select
                                value={aggregation}
                                onChange={(e) => setAggregation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="count">COUNT - Count records</option>
                                <option value="sum">SUM - Total sum</option>
                                <option value="avg">AVG - Average value</option>
                                <option value="min">MIN - Minimum value</option>
                                <option value="max">MAX - Maximum value</option>
                            </select>
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={!metricColumn || isLoading}
                            className="w-full"
                        >
                            {isLoading ? 'Generating...' : 'Generate Visualization'}
                        </Button>
                    </>
                )}

                {!selectedTable && (
                    <p className="text-sm text-gray-500 text-center py-8">
                        Select a table to start building your custom visualization
                    </p>
                )}
            </div>
        </div>
    );
}

export default CustomVisualizationBuilder;
