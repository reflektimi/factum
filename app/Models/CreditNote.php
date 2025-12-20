<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToUser;
use App\Traits\LogsActivity;
use App\Models\DocumentLineItem;
use App\Models\Account;
use App\Models\Invoice;

class CreditNote extends Model
{
    use BelongsToUser, LogsActivity;

    protected $fillable = [
        'user_id',
        'number',
        'customer_id',
        'invoice_id',
        'date',
        'amount',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'customer_id');
    }

    public function lineItems()
    {
        return $this->morphMany(DocumentLineItem::class, 'documentable');
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }
}
