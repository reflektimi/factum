<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    public static function bootLogsActivity()
    {
        static::created(function ($model) {
            $model->logActivity('created');
        });

        static::updated(function ($model) {
            $model->logActivity('updated');
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted');
        });
    }

    /**
     * Log an activity for this model
     */
    public function logActivity(string $event, ?string $description = null, array $properties = [])
    {
        if (!Auth::check()) {
            return;
        }

        // Throttle 'viewed' events to prevent spamming on reloads (e.g., once per 10 minutes per document per user)
        if ($event === 'viewed') {
            $lastView = ActivityLog::where('user_id', Auth::id())
                ->where('loggable_type', get_class($this))
                ->where('loggable_id', $this->id)
                ->where('event', 'viewed')
                ->where('created_at', '>=', now()->subMinutes(2))
                ->exists();

            if ($lastView) {
                return;
            }
        }

        // Add default properties like device info if not provided
        if (empty($properties) && Request::header('User-Agent')) {
            $agent = Request::header('User-Agent');
            $properties = [
                'device' => $this->getDeviceFromAgent($agent),
                'browser' => $this->getBrowserFromAgent($agent),
                'location' => 'Unknown Location', // In a real app, use a GeoIP service
            ];
        }

        return ActivityLog::create([
            'user_id' => Auth::id(),
            'loggable_type' => get_class($this),
            'loggable_id' => $this->id,
            'event' => $event,
            'description' => $description ?: "Document {$event}",
            'properties' => $properties,
            'ip_address' => Request::ip(),
            'user_agent' => Request::header('User-Agent'),
        ]);
    }

    /**
     * Get recent activity logs for this model
     */
    public function activityLogs()
    {
        return $this->morphMany(ActivityLog::class, 'loggable')->with('user')->latest();
    }

    /**
     * Helper to get simple device name from agent
     */
    private function getDeviceFromAgent($agent)
    {
        if (preg_match('/(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i', $agent)) {
            return 'Tablet';
        }
        if (preg_match('/(up.browser|up.link|mmp|symbian|smartphone|midp|wap|phone|android|iemobile)/i', $agent)) {
            return 'Mobile';
        }
        return 'Desktop';
    }

    /**
     * Helper to get browser name from agent
     */
    private function getBrowserFromAgent($agent)
    {
        if (preg_match('/MSIE/i', $agent)) return 'Internet Explorer';
        if (preg_match('/Firefox/i', $agent)) return 'Firefox';
        if (preg_match('/Chrome/i', $agent)) return 'Chrome';
        if (preg_match('/Safari/i', $agent)) return 'Safari';
        if (preg_match('/Opera/i', $agent)) return 'Opera';
        return 'Other';
    }
}
