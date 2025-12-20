<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;
use App\Traits\LogsActivity;
use App\Models\DocumentLineItem;
use App\Models\Account;

class Quote extends Model
{
    use BelongsToUser, LogsActivity;

    protected $fillable = [
        'user_id',
        'customer_id',
        'number',
        'date',
        'expiry_date',
        'status',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'expiry_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the customer for this quote
     */
    public function customer()
    {
        return $this->belongsTo(Account::class, 'customer_id');
    }

    public function lineItems()
    {
        return $this->morphMany(DocumentLineItem::class, 'documentable');
    }
}
