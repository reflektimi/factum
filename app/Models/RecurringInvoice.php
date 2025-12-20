<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToUser;
use App\Traits\LogsActivity;
use App\Models\DocumentLineItem;
use App\Models\Account;

class RecurringInvoice extends Model
{
    use BelongsToUser, LogsActivity;

    protected $fillable = [
        'user_id',
        'profile_name',
        'customer_id',
        'interval',
        'start_date',
        'next_run_date',
        'last_run_date',
        'total_amount',
        'status',
        'items',
        'auto_send',
    ];

    protected $casts = [
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

    public function lineItems()
    {
        return $this->morphMany(DocumentLineItem::class, 'documentable');
    }
}
