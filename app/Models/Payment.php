<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Payment extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'invoice_id',
        'customer_id',
        'amount',
        'date',
        'payment_method',
        'reference_number',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    /**
     * Get the invoice for this payment
     */
    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the customer (account) for this payment
     */
    public function customer()
    {
        return $this->belongsTo(Account::class, 'customer_id');
    }
}
