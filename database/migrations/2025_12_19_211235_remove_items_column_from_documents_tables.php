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
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn('items');
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->dropColumn('items');
        });

        Schema::table('recurring_invoices', function (Blueprint $table) {
            $table->dropColumn('items');
        });

        Schema::table('credit_notes', function (Blueprint $table) {
            $table->dropColumn('items');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->json('items')->nullable();
        });

        Schema::table('quotes', function (Blueprint $table) {
            $table->json('items')->nullable();
        });

        Schema::table('recurring_invoices', function (Blueprint $table) {
            $table->json('items')->nullable();
        });

        Schema::table('credit_notes', function (Blueprint $table) {
            $table->json('items')->nullable();
        });
    }
};
