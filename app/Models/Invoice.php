<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToUser;
use App\Traits\LogsActivity;
use App\Models\DocumentLineItem;
use App\Models\Payment;
use App\Models\Account;

class Invoice extends Model
{
    use BelongsToUser, LogsActivity, HasFactory;

    protected $fillable = [
        'user_id',
        'number',
        'customer_id',
        'date',
        'due_date',
        'total_amount',
        'status',
        'recurring_invoice_id',
    ];

    protected $casts = [
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
     * Alias for customer(), required for some legacy calls or factory logic expecting 'account'
     */
    public function account()
    {
        return $this->customer();
    }

    /**
     * Get payments for this invoice
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function lineItems()
    {
        return $this->morphMany(DocumentLineItem::class, 'documentable');
    }

    /**
     * Get the recurring invoice that generated this invoice
     */
    public function recurringInvoice()
    {
        return $this->belongsTo(RecurringInvoice::class);
    }
}
