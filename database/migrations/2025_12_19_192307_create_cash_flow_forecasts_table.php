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
        Schema::create('cash_flow_forecasts', function (Blueprint $table) {
            $table->id();
            $table->date('forecast_date'); // The month being forecasted
            $table->enum('scenario', ['optimistic', 'conservative', 'pessimistic'])->default('conservative');
            $table->decimal('projected_balance', 15, 2); // Ending cash balance
            $table->decimal('starting_balance', 15, 2); // Beginning cash balance
            $table->decimal('total_inflow', 15, 2); // Total expected cash in
            $table->decimal('total_outflow', 15, 2); // Total expected cash out
            $table->decimal('net_cash_flow', 15, 2); // Net change (inflow - outflow)
            
            // Breakdown of assumptions
            $table->json('assumptions')->nullable(); // Scenario-specific variables
            $table->json('components')->nullable(); // Detailed breakdown (revenue, expenses, etc.)
            
            // Inflow components
            $table->decimal('recurring_revenue', 15, 2)->default(0);
            $table->decimal('one_time_revenue', 15, 2)->default(0);
            $table->decimal('expected_collections', 15, 2)->default(0); // From outstanding invoices
            
            // Outflow components
            $table->decimal('recurring_expenses', 15, 2)->default(0);
            $table->decimal('payroll', 15, 2)->default(0);
            $table->decimal('taxes', 15, 2)->default(0);
            $table->decimal('one_time_expenses', 15, 2)->default(0);
            
            // Confidence & metadata
            $table->integer('confidence_score')->default(50); // 0-100
            $table->text('notes')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at');
            $table->timestamps();
            
            // Indexes
            $table->index(['forecast_date', 'scenario']);
            $table->index('generated_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_flow_forecasts');
    }
};
