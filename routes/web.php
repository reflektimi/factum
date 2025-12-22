<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return response()->json([
        'app' => 'Factum API',
        'status' => 'Active',
        'version' => '1.0.0'
    ]);
});

Route::middleware('auth')->group(function () {
    // SPA catch-all or specific web routes if any
});
