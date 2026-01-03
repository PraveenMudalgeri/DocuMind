"""
Schema definitions for database visualization endpoints.
These schemas are database-agnostic and work with any SQL database connection.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum


class ColumnDataType(str, Enum):
    """Column data type categories for visualization logic"""
    NUMERIC = "numeric"
    TEXT = "text"
    TIMESTAMP = "timestamp"
    BOOLEAN = "boolean"
    OTHER = "other"


class ColumnMetadata(BaseModel):
    """Metadata for a single database column"""
    name: str = Field(..., description="Column name")
    data_type: str = Field(..., description="Original SQL data type (e.g., 'INTEGER', 'VARCHAR')")
    category: ColumnDataType = Field(..., description="Categorized type for visualization logic")
    nullable: bool = Field(..., description="Whether column allows NULL values")
    is_primary_key: bool = Field(default=False, description="Whether column is a primary key")
    is_foreign_key: bool = Field(default=False, description="Whether column is a foreign key")


class NumericColumnStats(BaseModel):
    """Statistics for numeric columns"""
    column_name: str
    count: int = Field(..., description="Non-null value count")
    min_value: Optional[float] = Field(None, description="Minimum value")
    max_value: Optional[float] = Field(None, description="Maximum value")
    avg_value: Optional[float] = Field(None, description="Average value")
    sum_value: Optional[float] = Field(None, description="Sum of all values")


class TableMetadata(BaseModel):
    """Metadata for a single database table"""
    table_name: str = Field(..., description="Name of the table")
    row_count: int = Field(..., description="Total number of rows in the table")
    columns: List[ColumnMetadata] = Field(..., description="List of columns with metadata")
    numeric_columns: List[str] = Field(default_factory=list, description="Names of numeric columns")
    timestamp_columns: List[str] = Field(default_factory=list, description="Names of timestamp columns")
    text_columns: List[str] = Field(default_factory=list, description="Names of text columns")
    primary_keys: List[str] = Field(default_factory=list, description="Primary key column names")


class TableStatistics(BaseModel):
    """Statistical data for a table"""
    table_name: str
    row_count: int
    numeric_stats: List[NumericColumnStats] = Field(default_factory=list, description="Stats for numeric columns")


class TimeSeriesDataPoint(BaseModel):
    """Single data point for time-series visualization"""
    timestamp: str = Field(..., description="ISO format timestamp")
    value: float = Field(..., description="Aggregated value")
    label: Optional[str] = Field(None, description="Optional label/category")


class ChartConfig(BaseModel):
    """
    Configuration for a single chart visualization.
    This is a declarative config that the frontend can render with any chart library.
    """
    chart_id: str = Field(..., description="Unique identifier for this chart")
    chart_type: str = Field(..., description="Type: 'bar', 'line', 'pie', 'table'")
    title: str = Field(..., description="Chart title")
    description: Optional[str] = Field(None, description="Chart description")
    data: List[Dict[str, Any]] = Field(..., description="Chart data in key-value format")
    x_axis: Optional[str] = Field(None, description="X-axis field name")
    y_axis: Optional[str] = Field(None, description="Y-axis field name")
    x_label: Optional[str] = Field(None, description="X-axis label")
    y_label: Optional[str] = Field(None, description="Y-axis label")


class DatabaseVisualizationRequest(BaseModel):
    """Request to get database visualization metadata"""
    connection_id: str = Field(..., description="Active database connection ID")
    include_statistics: bool = Field(default=True, description="Whether to include statistical summaries")
    max_tables: Optional[int] = Field(None, description="Limit number of tables to analyze (for performance)")


class DatabaseVisualizationResponse(BaseModel):
    """
    Response containing database visualization metadata.
    Database-agnostic design - works with PostgreSQL, MySQL, SQLite, etc.
    """
    success: bool = Field(..., description="Whether the request was successful")
    connection_id: str = Field(..., description="Connection ID")
    database_type: str = Field(..., description="Type of database (postgresql, mysql, sqlite)")
    tables: List[TableMetadata] = Field(..., description="Metadata for all tables")
    statistics: List[TableStatistics] = Field(default_factory=list, description="Statistical summaries")
    suggested_charts: List[ChartConfig] = Field(default_factory=list, description="Auto-generated chart configs")
    total_tables: int = Field(..., description="Total number of tables")
    total_rows: int = Field(..., description="Sum of rows across all tables")
    error: Optional[str] = Field(None, description="Error message if any")


class CustomVisualizationRequest(BaseModel):
    """
    Request for a custom user-defined visualization.
    User can select table, dimensions, metrics, and aggregation.
    """
    connection_id: str = Field(..., description="Active database connection ID")
    table_name: str = Field(..., description="Table to query")
    chart_type: str = Field(..., description="Desired chart type: bar, line, pie")
    dimension_column: Optional[str] = Field(None, description="Column for grouping/x-axis")
    metric_column: str = Field(..., description="Column to aggregate (must be numeric for most charts)")
    aggregation: str = Field(default="count", description="Aggregation function: count, sum, avg, min, max")
    limit: int = Field(default=20, description="Max number of data points")
    order_by: str = Field(default="desc", description="Sort order: asc or desc")


class CustomVisualizationResponse(BaseModel):
    """Response for custom visualization"""
    success: bool
    chart_config: Optional[ChartConfig] = Field(None, description="Generated chart configuration")
    error: Optional[str] = Field(None, description="Error message if failed")
