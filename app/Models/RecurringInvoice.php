<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringInvoice extends Model
{
    protected $fillable = [
        'profile_name',
        'customer_id',
        'interval',
        'start_date',
        'next_run_date',
        'last_run_date',
        'status',
        'items',
        'total_amount',
        'auto_send',
    ];

    protected $casts = [
        'items' => 'array',
        'start_date' => 'date',
        'next_run_date' => 'date',
        'last_run_date' => 'date',
        'total_amount' => 'decimal:2',
        'auto_send' => 'boolean',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'customer_id');
    }
}
