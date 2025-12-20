<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Traits\BelongsToUser;
use App\Traits\LogsActivity;

class Expense extends Model
{
    use BelongsToUser, LogsActivity, HasFactory;

    protected $fillable = [
        'user_id',
        'description',
        'amount',
        'date',
        'category',
        'merchant',
        'receipt_path',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];
}
