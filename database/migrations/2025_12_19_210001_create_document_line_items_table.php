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
        Schema::create('document_line_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->morphs('documentable'); // documentable_id and documentable_type
            
            $table->text('description');
            $table->decimal('quantity', 15, 4); // Higher precision for quantities
            $table->decimal('unit_price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax_amount', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            
            $table->integer('sort_order')->default(0);
            $table->json('metadata')->nullable();
            
            $table->timestamps();

            $table->index(['documentable_id', 'documentable_type'], 'doc_items_morph_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_line_items');
    }
};
