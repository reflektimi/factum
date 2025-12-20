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
        Schema::create('financial_insights', function (Blueprint $table) {
            $table->id();
            $table->enum('type', [
                'anomaly',          // Unusual transactions
                'trend',            // Patterns over time
                'warning',          // Potential issues
                'opportunity',      // Positive insights
                'explanation'       // Why values changed
            ]);
            $table->enum('category', [
                'expense_spike',
                'revenue_drop',
                'margin_erosion',
                'burn_rate',
                'payment_delay',
                'missing_invoice',
                'duplicate_transaction',
                'unusual_amount',
                'cash_flow_warning',
                'seasonal_pattern',
                'vendor_change',
                'customer_behavior'
            ]);
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('title'); // "Operating expenses increased 18% MoM"
            $table->text('description'); // Detailed explanation
            $table->text('recommendation')->nullable(); // Suggested actions
            $table->json('metadata')->nullable(); // Additional context
            $table->json('affected_entities')->nullable(); // Links to invoices, expenses, etc.
            $table->decimal('impact_amount', 15, 2)->nullable(); // Financial impact
            $table->boolean('is_dismissed')->default(false);
            $table->foreignId('dismissed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('dismissed_at')->nullable();
            $table->timestamp('detected_at');
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['type', 'severity', 'detected_at']);
            $table->index(['is_dismissed', 'detected_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_insights');
    }
};
