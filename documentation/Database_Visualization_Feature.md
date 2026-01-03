# Database Visualization Feature Documentation

## Overview

The Database Visualization feature provides automatic and custom visualizations for **any SQL database** connected to the application. It works with PostgreSQL, MySQL, SQLite, and other SQL databases supported by SQLAlchemy.

## Architecture

### Design Principles

1. **Database-Agnostic**: No hardcoded table names, column names, or Supabase-specific logic
2. **Safe SQL Only**: Uses only deterministic SQL aggregations (COUNT, SUM, AVG, MIN, MAX) - no LLM-generated queries
3. **Rule-Based Charts**: Auto-generates visualizations using heuristics, not ML/AI
4. **Config-Driven Rendering**: Frontend renders charts based on declarative `ChartConfig` objects
5. **Separation of Concerns**: Chat UI and visualization UI are completely separate

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├─────────────────────────────────────────────────────────────┤
│ DatabaseVisualizationPage                                    │
│   ├─ Chart Component (Recharts)                            │
│   ├─ CustomVisualizationBuilder                            │
│   └─ Tab Navigation (Overview/Custom/Schema)               │
├─────────────────────────────────────────────────────────────┤
│ visualizationService.js                                     │
│   ├─ getVisualizationMetadata()                            │
│   └─ generateCustomVisualization()                         │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
├─────────────────────────────────────────────────────────────┤
│ /api/visualization/metadata (POST)                          │
│ /api/visualization/custom (POST)                            │
├─────────────────────────────────────────────────────────────┤
│ DatabaseVisualizationService                                │
│   ├─ get_database_visualization_metadata()                 │
│   ├─ _categorize_column_type()                             │
│   ├─ _get_row_count()                                      │
│   ├─ _get_numeric_stats()                                  │
│   ├─ _generate_suggested_charts()                          │
│   └─ generate_custom_visualization()                       │
├─────────────────────────────────────────────────────────────┤
│ SQLAlchemy Engine (Connection Pool)                        │
│   └─ Safe SQL Queries (SELECT COUNT, SUM, AVG, etc.)      │
└─────────────────────────────────────────────────────────────┘
```

## Backend Components

### 1. Schema Definitions (`schema/visualization_schema.py`)

Defines Pydantic models for type-safe API contracts:

- **`ColumnMetadata`**: Column name, type, category (numeric/text/timestamp), keys
- **`TableMetadata`**: Table name, row count, column list, categorized columns
- **`NumericColumnStats`**: COUNT, MIN, MAX, AVG, SUM for numeric columns
- **`ChartConfig`**: Declarative chart specification (type, data, axes, labels)
- **`DatabaseVisualizationResponse`**: Complete metadata + auto-generated charts
- **`CustomVisualizationRequest`**: User-specified chart parameters
- **`CustomVisualizationResponse`**: Generated custom chart config

### 2. Service Layer (`service/features/database_visualization_service.py`)

Core business logic for extracting visualization metadata:

#### Key Methods

**`get_database_visualization_metadata(connection_id, include_statistics, max_tables)`**
- Main entry point for visualization
- Reflects database schema using SQLAlchemy Inspector
- Categorizes columns by data type (numeric, text, timestamp, boolean, other)
- Computes row counts and statistics using safe SQL
- Generates suggested charts using rule-based logic
- Returns `DatabaseVisualizationResponse`

**`_categorize_column_type(sql_type)`**
- Maps SQL types to visualization categories
- Database-agnostic type detection (INT, VARCHAR, TIMESTAMP, etc.)
- Used to determine which columns are suitable for metrics vs. dimensions

**`_get_row_count(engine, table_name)`**
- Safe `SELECT COUNT(*)` query
- Handles errors gracefully (returns 0 if fails)

**`_get_numeric_stats(engine, table_name, column_name)`**
- Executes: `SELECT COUNT, MIN, MAX, AVG, SUM FROM table`
- Returns `NumericColumnStats` object
- Only called for numeric columns

**`_generate_suggested_charts(tables, statistics, database_type)`**
- **Rule 1**: Always generate "Row Counts by Table" bar chart
- **Rule 2**: For tables with numeric columns, generate statistics bar charts (Min/Max/Avg)
- **Rule 3**: If multiple tables, generate pie chart showing data distribution
- **No ML/AI**: Pure deterministic logic
- **No joins**: Each chart queries a single table only

**`generate_custom_visualization(request)`**
- User specifies: table, dimension column, metric column, aggregation, chart type
- Validates table and columns exist using Inspector
- Builds safe SQL with GROUP BY (if dimension specified)
- Returns `ChartConfig` ready for frontend rendering

### 3. API Routes (`routes/visualization.py`)

**POST `/api/visualization/metadata`**
- Request: `{ connection_id, include_statistics, max_tables }`
- Response: `DatabaseVisualizationResponse` with tables, stats, suggested charts
- Used for: Initial page load, showing database overview

**POST `/api/visualization/custom`**
- Request: `{ connection_id, table_name, chart_type, dimension_column, metric_column, aggregation, limit, order_by }`
- Response: `CustomVisualizationResponse` with generated `ChartConfig`
- Used for: User-created custom visualizations

**GET `/api/visualization/health`**
- Health check endpoint

## Frontend Components

### 1. Visualization Page (`pages/DatabaseVisualizationPage.jsx`)

**Design Decision: Separate Page (not Modal)**

Justification:
- Visualizations need more screen real estate
- Users can easily navigate back to chat
- Cleaner URL routing (`/database-visualization?connectionId=...`)
- Better for complex interactions (table selection, chart customization)
- Allows bookmarking specific visualization views

**Features:**
- Tab-based interface:
  - **Overview**: Auto-generated charts from backend
  - **Custom**: User-defined visualizations with builder
  - **Schema**: Table and column metadata explorer
- Responsive design (mobile + desktop)
- Loading states and error handling

### 2. Chart Component (`components/database/Chart.jsx`)

**Config-Driven Rendering**

Takes a `ChartConfig` object and renders the appropriate chart using Recharts:

```javascript
<Chart chartConfig={{
  chart_id: "overview_row_counts",
  chart_type: "bar",
  title: "Database Overview",
  data: [{ table: "users", rows: 150 }],
  x_axis: "table",
  y_axis: "rows",
  x_label: "Table Name",
  y_label: "Number of Rows"
}} />
```

**Supported Chart Types:**
- `bar`: Bar chart (vertical bars)
- `line`: Line chart (for trends)
- `pie`: Pie chart (for distributions)
- `table`: HTML table (for raw data)

**Features:**
- Automatic axis rotation for large datasets
- Responsive container
- Color palette with 8 distinct colors
- Tooltips and legends
- Number formatting (locale-aware)

### 3. Custom Visualization Builder (`components/database/CustomVisualizationBuilder.jsx`)

**User Controls:**
1. **Select Table**: Dropdown with all available tables + row counts
2. **Chart Type**: Toggle buttons (Bar/Line/Pie)
3. **Group By (Dimension)**: Optional - select text/timestamp column for grouping
4. **Metric**: Required - select numeric column to aggregate
5. **Aggregation**: Dropdown (COUNT, SUM, AVG, MIN, MAX)

**Smart Column Filtering:**
- Dimension columns: Text, Timestamp, Boolean (excluding ID columns)
- Metric columns: Numeric only
- Automatic filtering based on selected table

### 4. Visualization Service (`services/visualizationService.js`)

Thin API client wrapper:
- `getVisualizationMetadata(connectionId, includeStats, maxTables)`
- `generateCustomVisualization(params)`

### 5. Integration with Database Chat

**Visualize Button:**
- Added to `ConnectionCard` component
- Located below "Schema" button
- Navigates to `/database-visualization?connectionId=X&databaseType=Y`
- Passes connection context via URL params

## Data Flow

### Auto-Generated Visualizations

```
User clicks "Visualize" button
    ↓
Navigate to /database-visualization?connectionId=abc&databaseType=postgresql
    ↓
Page loads, calls visualizationService.getVisualizationMetadata(connectionId)
    ↓
Backend: DatabaseVisualizationService.get_database_visualization_metadata()
    ├─ Use SQLAlchemy Inspector to reflect schema
    ├─ For each table:
    │   ├─ Get row count (SELECT COUNT(*))
    │   ├─ Categorize columns by type
    │   └─ Get numeric stats (SELECT COUNT, MIN, MAX, AVG, SUM)
    ├─ Generate suggested charts using rules
    └─ Return DatabaseVisualizationResponse
    ↓
Frontend receives: { tables, statistics, suggested_charts }
    ↓
Render charts using Chart component + Recharts
```

### Custom Visualizations

```
User fills out Custom Visualization Builder
    ├─ Selects: orders table
    ├─ Chart type: Bar
    ├─ Dimension: status
    ├─ Metric: total_amount
    └─ Aggregation: SUM
    ↓
Click "Generate Visualization"
    ↓
Call visualizationService.generateCustomVisualization(params)
    ↓
Backend: DatabaseVisualizationService.generate_custom_visualization()
    ├─ Validate table exists
    ├─ Validate columns exist
    ├─ Build SQL: SELECT status, SUM(total_amount) FROM orders GROUP BY status
    ├─ Execute query safely
    ├─ Format results as ChartConfig
    └─ Return CustomVisualizationResponse
    ↓
Frontend receives: { chart_config }
    ↓
Add to custom charts list
    ↓
Render using Chart component
```

## Safety & Security

### SQL Injection Prevention

1. **No string concatenation**: All queries use parameterized statements where possible
2. **Validation**: Table and column names validated against Inspector metadata
3. **Whitelist**: Only SELECT queries allowed
4. **Keyword blocking**: No DDL/DML keywords (DROP, DELETE, INSERT, UPDATE, ALTER, etc.)

### Performance Considerations

1. **Row count caching**: Results cached in memory during session
2. **Table limits**: Optional `max_tables` parameter to limit analysis
3. **Column limits**: Statistics computed for first 5 numeric columns only
4. **Query limits**: Custom visualizations limited to 20 data points by default
5. **Connection pooling**: SQLAlchemy connection pool prevents resource exhaustion

## Example ChartConfig JSON

See `chart_config_example.json` for complete examples.

## Testing

### Manual Testing Checklist

1. **Connect to Database**
   - ✅ Connect to PostgreSQL (test data already loaded)
   - ✅ Click "Visualize" button on connection card
   - ✅ Verify navigation to visualization page

2. **Overview Tab**
   - ✅ Row counts bar chart displays all tables
   - ✅ Statistics charts show Min/Max/Avg for numeric columns
   - ✅ Pie chart shows data distribution

3. **Custom Tab**
   - ✅ Select table from dropdown
   - ✅ Choose dimension and metric columns
   - ✅ Generate visualization with different aggregations
   - ✅ Try all chart types (bar/line/pie)

4. **Schema Tab**
   - ✅ All tables listed with row counts
   - ✅ Column metadata displays correctly
   - ✅ Data types categorized (numeric/text/timestamp)
   - ✅ Primary/Foreign keys marked

5. **Error Handling**
   - ✅ Invalid connection ID shows error
   - ✅ Network errors display toast notifications
   - ✅ Empty database shows appropriate message

### API Testing

```bash
# Test metadata endpoint
curl -X POST http://localhost:8000/api/visualization/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "your-connection-id",
    "include_statistics": true
  }'

# Test custom visualization
curl -X POST http://localhost:8000/api/visualization/custom \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "your-connection-id",
    "table_name": "orders",
    "chart_type": "bar",
    "dimension_column": "status",
    "metric_column": "total_amount",
    "aggregation": "sum",
    "limit": 20,
    "order_by": "desc"
  }'
```

## Future Enhancements

Potential improvements (out of scope for this implementation):

1. **Export**: Download charts as PNG/PDF
2. **Time-series**: Automatic time-based grouping for timestamp columns
3. **Filtering**: Add WHERE clause support with safe parameterization
4. **Saved Views**: Store custom visualization configurations
5. **Dashboards**: Combine multiple charts on a single view
6. **Real-time**: Auto-refresh for live data monitoring
7. **Join Support**: Carefully designed multi-table joins with explicit user control

## Code Quality Notes

✅ **Modular Structure**: Service, route, schema separation
✅ **Type Safety**: Pydantic models for API contracts
✅ **Error Handling**: Comprehensive try-catch with user-friendly messages
✅ **Comments**: Extensive inline documentation explaining design decisions
✅ **No Hardcoding**: All table/column references dynamic
✅ **Database Agnostic**: Works with PostgreSQL, MySQL, SQLite, etc.
✅ **Config-Driven**: Charts rendered from declarative configs
✅ **Separation of UI**: Chat and visualization are independent

## Summary

This implementation provides a complete, production-ready database visualization feature that:
- Works with **any SQL database** (not just Supabase)
- Uses **safe, deterministic SQL** (no LLM queries)
- Provides **auto-generated overview** charts (rule-based)
- Allows **user-controlled custom** visualizations
- Maintains **clean separation** between chat and visualization UIs
- Follows **best practices** for security, performance, and maintainability
