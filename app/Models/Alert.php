<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;


class Alert extends Model
{
    protected $fillable = [
        'type',
        'priority',
        'title',
        'message',
        'data',
        'triggered_by_user_id',
        'target_user_id',
        'target_role',
        'delivery_channel',
        'is_read',
        'read_at',
        'action_url',
        'is_actionable',
        'is_dismissed',
        'dismissed_at',
        'triggered_at',
        'expires_at',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'is_actionable' => 'boolean',
        'is_dismissed' => 'boolean',
        'read_at' => 'datetime',
        'dismissed_at' => 'datetime',
        'triggered_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user who triggered this alert
     */
    public function triggeredBy()
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }

    /**
     * Get the target user for this alert
     */
    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    /**
     * Scope to get unread alerts
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false)->where('is_dismissed', false);
    }

    /**
     * Scope to get alerts for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('target_user_id', $userId);
    }

    /**
     * Scope to get alerts for a specific role
     */
    public function scopeForRole($query, $role)
    {
        return $query->where('target_role', $role);
    }

    /**
     * Scope to get active (non-expired, non-dismissed) alerts
     */
    public function scopeActive($query)
    {
        return $query->where('is_dismissed', false)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            });
    }

    /**
     * Mark this alert as read
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /**
     * Dismiss this alert
     */
    public function dismiss()
    {
        $this->update([
            'is_dismissed' => true,
            'dismissed_at' => now(),
        ]);
    }
}

