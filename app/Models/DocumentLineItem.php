<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class DocumentLineItem extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'documentable_id',
        'documentable_type',
        'description',
        'quantity',
        'unit_price',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total',
        'sort_order',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Get the parent documentable model (Invoice, Quote, etc.).
     */
    public function documentable()
    {
        return $this->morphTo();
    }
}
