<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->enum('type', [
                'cash_flow_warning',
                'invoice_overdue',
                'expense_over_limit',
                'unusual_transaction',
                'recurring_invoice_failed',
                'bank_sync_error',
                'payment_received',
                'budget_threshold',
                'tax_deadline',
                'approval_needed'
            ]);
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable(); // Additional context
            $table->foreignId('triggered_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('target_role')->nullable(); // If alert targets a role
            $table->enum('delivery_channel', ['in_app', 'email', 'sms', 'all'])->default('in_app');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->string('action_url')->nullable(); // Where to redirect when clicked
            $table->boolean('is_actionable')->default(false);
            $table->boolean('is_dismissed')->default(false);
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamp('triggered_at');
            $table->timestamp('expires_at')->nullable(); // Auto-dismiss after date
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['target_user_id', 'is_read', 'triggered_at']);
            $table->index(['target_role', 'is_read', 'triggered_at']);
            $table->index(['type', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
