<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class CashFlowForecast extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'forecast_date',
        'scenario',
        'projected_balance',
        'starting_balance',
        'total_inflow',
        'total_outflow',
        'net_cash_flow',
        'assumptions',
        'components',
        'recurring_revenue',
        'one_time_revenue',
        'expected_collections',
        'recurring_expenses',
        'payroll',
        'taxes',
        'one_time_expenses',
        'confidence_score',
        'notes',
        'generated_by',
        'generated_at',
    ];

    protected $casts = [
        'forecast_date' => 'date',
        'projected_balance' => 'decimal:2',
        'starting_balance' => 'decimal:2',
        'total_inflow' => 'decimal:2',
        'total_outflow' => 'decimal:2',
        'net_cash_flow' => 'decimal:2',
        'assumptions' => 'array',
        'components' => 'array',
        'recurring_revenue' => 'decimal:2',
        'one_time_revenue' => 'decimal:2',
        'expected_collections' => 'decimal:2',
        'recurring_expenses' => 'decimal:2',
        'payroll' => 'decimal:2',
        'taxes' => 'decimal:2',
        'one_time_expenses' => 'decimal:2',
        'generated_at' => 'datetime',
    ];

    /**
     * Get the user who generated this forecast
     */
    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Scope to get forecasts for a specific scenario
     */
    public function scopeScenario($query, $scenario)
    {
        return $query->where('scenario', $scenario);
    }

    /**
     * Scope to get forecasts for a date range
     */
    public function scopeDateRange($query, $start, $end)
    {
        return $query->whereBetween('forecast_date', [$start, $end]);
    }

    /**
     * Scope to get recent forecasts
     */
    public function scopeRecent($query)
    {
        return $query->orderBy('generated_at', 'desc');
    }

    /**
     * Check if this forecast shows negative cash flow
     */
    public function isNegative()
    {
        return $this->projected_balance < 0;
    }

    /**
     * Check if cash is running low (< threshold)
     */
    public function isRunningLow($threshold = 10000)
    {
        return $this->projected_balance < $threshold && $this->projected_balance > 0;
    }
}

