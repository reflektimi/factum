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
        // Safely add recurring_invoice_id to invoices
        if (Schema::hasTable('invoices') && !Schema::hasColumn('invoices', 'recurring_invoice_id')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->foreignId('recurring_invoice_id')
                    ->nullable()
                    ->after('customer_id')
                    ->constrained('recurring_invoices')
                    ->onDelete('set null');
            });
        }

        // Safely add reference_number to payments
        if (Schema::hasTable('payments') && !Schema::hasColumn('payments', 'reference_number')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->string('reference_number')
                    ->nullable()
                    ->after('payment_method');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('invoices', 'recurring_invoice_id')) {
            Schema::table('invoices', function (Blueprint $table) {
                $table->dropConstrainedForeignId('recurring_invoice_id');
            });
        }

        if (Schema::hasColumn('payments', 'reference_number')) {
            Schema::table('payments', function (Blueprint $table) {
                $table->dropColumn('reference_number');
            });
        }
    }
};
