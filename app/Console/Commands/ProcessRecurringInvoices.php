<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;
use App\Models\RecurringInvoice;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class ProcessRecurringInvoices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'process:recurring-invoices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process active recurring invoice profiles and generate scheduled invoices';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        
        $this->info("Checking for recurring invoices due on or before: " . $today->toDateString());

        $profiles = RecurringInvoice::with('lineItems')
            ->where('status', 'active')
            ->whereDate('next_run_date', '<=', $today)
            ->get();

        if ($profiles->isEmpty()) {
            $this->info("No recurring invoices due.");
            return;
        }

        $count = 0;

        foreach ($profiles as $profile) {
            $this->info("Processing profile: {$profile->profile_name} (ID: {$profile->id})");

            try {
                DB::transaction(function () use ($profile, $today, &$count) {
                    // Generate Invoice Number
                    $year = date('Y');
                    $random = str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
                    $invoiceNumber = "INV-REC-{$year}-{$random}-{$profile->id}";

                    // Create Invoice
                    $invoice = Invoice::create([
                        'user_id' => $profile->user_id,
                        'number' => $invoiceNumber,
                        'customer_id' => $profile->customer_id,
                        'date' => $today,
                        'due_date' => $today->copy()->addDays(14),
                        'status' => $profile->auto_send ? 'sent' : 'draft',
                        'total_amount' => $profile->total_amount,
                        'notes' => "Automatically generated from recurring profile: {$profile->profile_name}",
                    ]);

                    // Copy Line Items
                    foreach ($profile->lineItems as $item) {
                        $invoice->lineItems()->create([
                            'user_id' => $profile->user_id,
                            'description' => $item->description,
                            'quantity' => $item->quantity,
                            'unit_price' => $item->unit_price,
                            'subtotal' => $item->subtotal,
                            'tax_rate' => $item->tax_rate,
                            'tax_amount' => $item->tax_amount,
                            'total' => $item->total,
                            'sort_order' => $item->sort_order,
                        ]);
                    }

                    // Calculate next run date
                    $nextRun = Carbon::parse($profile->next_run_date);
                    
                    switch ($profile->interval) {
                        case 'monthly':
                            $nextRun->addMonth();
                            break;
                        case 'quarterly':
                            $nextRun->addMonths(3);
                            break;
                        case 'yearly':
                            $nextRun->addYear();
                            break;
                    }

                    $profile->update([
                        'last_run_date' => $today,
                        'next_run_date' => $nextRun,
                    ]);
                    
                    $this->info("  -> Generated Invoice: {$invoice->number}");
                    $this->info("  -> Next run date set to: {$nextRun->toDateString()}");
                    $count++;
                });

            } catch (\Exception $e) {
                $this->error("  -> Failed to process profile ID {$profile->id}: " . $e->getMessage());
            }
        }

        $this->info("Completed. Generated {$count} invoices.");
    }
}
