<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class ReportLineItem extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'report_id',
        'section',
        'category',
        'subcategory',
        'line_item_name',
        'amount',
        'currency',
        'description',
        'source_transactions',
        'display_order',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'source_transactions' => 'array',
        'display_order' => 'integer',
    ];

    /**
     * Get the report this line item belongs to
     */
    public function report()
    {
        return $this->belongsTo(Report::class);
    }

    /**
     * Scope to get items for a specific section
     */
    public function scopeSection($query, $section)
    {
        return $query->where('section', $section);
    }

    /**
     * Scope to order by display order
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}

