<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;


class FinancialInsight extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'type',
        'category',
        'severity',
        'title',
        'description',
        'recommendation',
        'metadata',
        'affected_entities',
        'impact_amount',
        'is_dismissed',
        'dismissed_by',
        'dismissed_at',
        'detected_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'affected_entities' => 'array',
        'impact_amount' => 'decimal:2',
        'is_dismissed' => 'boolean',
        'dismissed_at' => 'datetime',
        'detected_at' => 'datetime',
    ];

    /**
     * Get the user who dismissed this insight
     */
    public function dismissedBy()
    {
        return $this->belongsTo(User::class, 'dismissed_by');
    }

    /**
     * Scope to get active (non-dismissed) insights
     */
    public function scopeActive($query)
    {
        return $query->where('is_dismissed', false);
    }

    /**
     * Scope to get insights by severity
     */
    public function scopeSeverity($query, $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope to get recent insights
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('detected_at', '>=', now()->subDays($days));
    }

    /**
     * Dismiss this insight
     */
    public function dismiss($userId = null)
    {
        $this->update([
            'is_dismissed' => true,
            'dismissed_by' => $userId ?? auth()->id(),
            'dismissed_at' => now(),
        ]);
    }
}

