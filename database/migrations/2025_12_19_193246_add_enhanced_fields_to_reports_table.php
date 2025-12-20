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
        Schema::table('reports', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('type');
            $table->date('end_date')->nullable()->after('start_date');
            $table->date('as_of_date')->nullable()->after('end_date'); // For balance sheet
            $table->string('currency', 3)->default('USD')->after('as_of_date');
            $table->json('parameters')->nullable()->after('currency'); // Store filters, options
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date', 'as_of_date', 'currency', 'parameters']);
        });
    }
};
