<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $fillable = [
        'customer_id',
        'number',
        'date',
        'expiry_date',
        'status',
        'items',
        'total_amount',
        'notes',
    ];

    protected $casts = [
        'items' => 'array',
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
}
