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
        Schema::create('recurring_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('profile_name');
            $table->foreignId('customer_id')->constrained('accounts')->onDelete('cascade');
            $table->string('interval'); // monthly, quarterly, yearly
            $table->date('start_date');
            $table->date('next_run_date')->nullable();
            $table->date('last_run_date')->nullable();
            $table->string('status')->default('active'); // active, paused, ended
            $table->json('items');
            $table->decimal('total_amount', 15, 2);
            $table->boolean('auto_send')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('recurring_invoices');
    }
};
