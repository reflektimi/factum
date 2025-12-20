<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\BelongsToUser;

class Setting extends Model
{
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'company_name',
        'address',
        'phone',
        'email',
        'logo_path',
        'primary_color',
        'bank_details',
        'tax_rules',
        'currencies',
    ];

    protected $casts = [
        'tax_rules' => 'array',
        'currencies' => 'array',
    ];
}
