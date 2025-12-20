<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToUser;
use App\Traits\LogsActivity;

class Account extends Model
{
    use BelongsToUser, LogsActivity, HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'contact_info',
        'balance',
        'transactions',
    ];

    protected $casts = [
        'contact_info' => 'array',
        'transactions' => 'array',
        'balance' => 'decimal:2',
    ];

    /**
     * Get invoices for this account (as customer)
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class, 'customer_id');
    }

    /**
     * Get payments for this account (as customer)
     */
    public function payments()
    {
        return $this->hasMany(Payment::class, 'customer_id');
    }
}
