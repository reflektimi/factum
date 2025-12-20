<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Report extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'title',
        'type',
        'data',
        'start_date',
        'end_date',
        'as_of_date',
        'currency',
        'parameters',
        'generated_at',
        'generated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'as_of_date' => 'date',
        'parameters' => 'array',
        'data' => 'array',
        'generated_at' => 'datetime',
    ];

    /**
     * Get the user who generated this report
     */
    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Get the line items for this report
     */
    public function lineItems()
    {
        return $this->hasMany(ReportLineItem::class)->ordered();
    }
}
