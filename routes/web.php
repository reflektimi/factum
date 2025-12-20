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
    Route::get('invoices/{invoice}/download', [App\Http\Controllers\InvoiceController::class, 'download'])->name('invoices.download');
    Route::post('invoices/{invoice}/resend', [App\Http\Controllers\InvoiceController::class, 'resend'])->name('invoices.resend');
    Route::get('invoices/{invoice}/public', [App\Http\Controllers\InvoiceController::class, 'publicView'])->name('invoices.public');
    Route::resource('payments', App\Http\Controllers\PaymentController::class);
    Route::resource('accounts', App\Http\Controllers\AccountController::class);
    Route::resource('quotes', App\Http\Controllers\QuoteController::class);
    Route::get('quotes/{quote}/download', [App\Http\Controllers\QuoteController::class, 'download'])->name('quotes.download');
    Route::post('quotes/{quote}/convert', [App\Http\Controllers\QuoteController::class, 'convert'])->name('quotes.convert');
    Route::post('quotes/{quote}/resend', [App\Http\Controllers\QuoteController::class, 'resend'])->name('quotes.resend');
    Route::get('quotes/{quote}/public', [App\Http\Controllers\QuoteController::class, 'publicView'])->name('quotes.public');
    Route::resource('credit-notes', App\Http\Controllers\CreditNoteController::class);
    Route::resource('expenses', App\Http\Controllers\ExpenseController::class);
    Route::resource('recurring-invoices', App\Http\Controllers\RecurringInvoiceController::class);
    Route::post('recurring-invoices/{recurring_invoice}/run', [App\Http\Controllers\RecurringInvoiceController::class, 'run'])->name('recurring-invoices.run');
    Route::resource('reports', App\Http\Controllers\ReportController::class);
    Route::get('reports/{report}/download', [App\Http\Controllers\ReportController::class, 'download'])->name('reports.download');
    
    // Settings & Users
    Route::get('/settings', [App\Http\Controllers\SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [App\Http\Controllers\SettingController::class, 'update'])->name('settings.update');
    Route::get('/global-search', App\Http\Controllers\SearchController::class)->name('global.search');
    
    // Notifications
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // Forecast & Insights Generation
    Route::post('/forecast/cashflow', [App\Http\Controllers\ForecastController::class, 'generateCashFlow'])->name('forecast.cashflow');
    Route::post('/forecast/insights', [App\Http\Controllers\ForecastController::class, 'generateInsights'])->name('forecast.insights');
    Route::post('/forecast/refresh-all', [App\Http\Controllers\ForecastController::class, 'refreshAll'])->name('forecast.refresh-all');

    Route::resource('users', App\Http\Controllers\UserController::class);
});

require __DIR__.'/auth.php';
