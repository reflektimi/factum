<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Finance Resources
    Route::resource('invoices', App\Http\Controllers\InvoiceController::class);
    Route::resource('payments', App\Http\Controllers\PaymentController::class);
    Route::resource('accounts', App\Http\Controllers\AccountController::class);
    Route::resource('quotes', App\Http\Controllers\QuoteController::class);
    Route::post('quotes/{quote}/convert', [App\Http\Controllers\QuoteController::class, 'convert'])->name('quotes.convert');
    Route::resource('credit-notes', App\Http\Controllers\CreditNoteController::class);
    Route::resource('expenses', App\Http\Controllers\ExpenseController::class);
    Route::resource('recurring-invoices', App\Http\Controllers\RecurringInvoiceController::class);
    Route::resource('reports', App\Http\Controllers\ReportController::class);
    
    // Settings & Users
    Route::get('/settings', [App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [App\Http\Controllers\SettingController::class, 'update'])->name('settings.update');
    Route::get('/global-search', App\Http\Controllers\SearchController::class)->name('global.search');
    
    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    Route::resource('users', App\Http\Controllers\UserController::class);
});

require __DIR__.'/auth.php';
