<?php

use App\Http\Controllers\ProfileController;
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
