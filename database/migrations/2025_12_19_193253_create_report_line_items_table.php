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
        Schema::create('report_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->cascadeOnDelete();
            $table->string('section'); // 'revenue', 'expenses', 'assets', 'liabilities', 'equity', etc.
            $table->string('category'); // 'Operating Expenses', 'Cash', 'Accounts Receivable', etc.
            $table->string('subcategory')->nullable();
            $table->string('line_item_name');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->text('description')->nullable();
            $table->json('source_transactions')->nullable(); // IDs and types of source records
            $table->integer('display_order')->default(0);
            $table->timestamps();
            
            $table->index(['report_id', 'section']);
            $table->index('display_order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_line_items');
    }
};
