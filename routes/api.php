<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\CreditNoteController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\RecurringInvoiceController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ForecastController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\NewPasswordController;

Route::middleware('guest')->group(function () {
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('register');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.update');
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/profile', [ProfileController::class, 'edit']);
    Route::patch('/profile', [ProfileController::class, 'update']);
    Route::delete('/profile', [ProfileController::class, 'destroy']);
    
    // Finance Resources
    Route::get('invoices/create', [InvoiceController::class, 'create']);
    Route::get('invoices/{invoice}/edit', [InvoiceController::class, 'edit']);
    Route::apiResource('invoices', InvoiceController::class);
    Route::get('invoices/{invoice}/download', [InvoiceController::class, 'download']);
    Route::post('invoices/{invoice}/resend', [InvoiceController::class, 'resend']);
    Route::get('invoices/{invoice}/public', [InvoiceController::class, 'publicView']);
    
    Route::get('payments/create', [PaymentController::class, 'create']);
    Route::get('payments/{payment}/edit', [PaymentController::class, 'edit']);
    Route::apiResource('payments', PaymentController::class);

    Route::get('accounts/create', [AccountController::class, 'create']);
    Route::get('accounts/{account}/edit', [AccountController::class, 'edit']);
    Route::apiResource('accounts', AccountController::class);
    
    Route::get('quotes/create', [QuoteController::class, 'create']);
    Route::get('quotes/{quote}/edit', [QuoteController::class, 'edit']);
    Route::apiResource('quotes', QuoteController::class);
    Route::get('quotes/{quote}/download', [QuoteController::class, 'download']);
    Route::post('quotes/{quote}/convert', [QuoteController::class, 'convert']);
    Route::post('quotes/{quote}/resend', [QuoteController::class, 'resend']);
    Route::get('quotes/{quote}/public', [QuoteController::class, 'publicView']);
    
    Route::get('credit-notes/create', [CreditNoteController::class, 'create']);
    Route::get('credit-notes/{credit_note}/edit', [CreditNoteController::class, 'edit']);
    Route::apiResource('credit-notes', CreditNoteController::class);

    Route::get('expenses/create', [ExpenseController::class, 'create']);
    Route::get('expenses/{expense}/edit', [ExpenseController::class, 'edit']);
    Route::apiResource('expenses', ExpenseController::class);
    
    Route::get('recurring-invoices/create', [RecurringInvoiceController::class, 'create']);
    Route::get('recurring-invoices/{recurring_invoice}/edit', [RecurringInvoiceController::class, 'edit']);
    Route::apiResource('recurring-invoices', RecurringInvoiceController::class);
    Route::post('recurring-invoices/{recurring_invoice}/run', [RecurringInvoiceController::class, 'run']);
    
    Route::apiResource('reports', ReportController::class);
    Route::get('reports/{report}/download', [ReportController::class, 'download']);
    
    // Settings & Users
    Route::get('/settings', [SettingController::class, 'index']);
    Route::post('/settings', [SettingController::class, 'update']);
    Route::get('/global-search', SearchController::class);
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Forecast & Insights Generation
    Route::post('/forecast/cashflow', [ForecastController::class, 'generateCashFlow']);
    Route::post('/forecast/insights', [ForecastController::class, 'generateInsights']);
    Route::post('/forecast/refresh-all', [ForecastController::class, 'refreshAll']);

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);
    Route::apiResource('users', UserController::class);
});
