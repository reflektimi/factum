<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'number',
        'customer_id',
        'date',
        'due_date',
        'items',
        'total_amount',
        'status',
    ];

    protected $casts = [
        'items' => 'array',
        'date' => 'date',
        'due_date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    /**
     * Get the customer (account) for this invoice
     */
    public function customer()
    {
        return $this->belongsTo(Account::class, 'customer_id');
    }

    /**
     * Get payments for this invoice
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
