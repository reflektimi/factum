<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
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
