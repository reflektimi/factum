<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Invoice;
use App\Models\Quote;
use App\Models\RecurringInvoice;
use App\Models\CreditNote;
use App\Models\DocumentLineItem;
use Illuminate\Support\Facades\DB;

class MigrateJsonToRelationalLineItems extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:migrate-json-to-relational-line-items';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migrate items from JSON columns to the document_line_items table';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting migration items from JSON columns to relational table...');

        $documentTypes = [
            'Invoice' => Invoice::class,
            'Quote' => Quote::class,
            'RecurringInvoice' => RecurringInvoice::class,
            'CreditNote' => CreditNote::class,
        ];

        foreach ($documentTypes as $label => $modelClass) {
            $this->info("Processing {$label} records...");
            
            // Use withoutGlobalScopes to ensure we see all data for migration
            $documents = $modelClass::withoutGlobalScopes()->get();
            $count = 0;

            foreach ($documents as $document) {
                try {
                    $items = $document->items;

                    if (empty($items) || !is_array($items)) {
                        continue;
                    }

                    foreach ($items as $index => $item) {
                        // Skip if item is null or not an array
                        if (empty($item) || !is_array($item)) {
                            continue;
                        }

                        $description = $item['description'] ?? $item['name'] ?? 'No description';
                        $quantity = (float)($item['quantity'] ?? 1);
                        $price = (float)($item['price'] ?? $item['unit_price'] ?? 0);
                        $subtotal = $quantity * $price;
                        
                        // Check if already migrated
                        $exists = DocumentLineItem::withoutGlobalScopes()
                            ->where('documentable_id', $document->id)
                            ->where('documentable_type', $modelClass)
                            ->where('description', $description)
                            ->where('sort_order', $index)
                            ->exists();

                        if ($exists) {
                            continue;
                        }

                        DocumentLineItem::create([
                            'user_id' => $document->user_id,
                            'documentable_id' => $document->id,
                            'documentable_type' => $modelClass,
                            'description' => $description,
                            'quantity' => $quantity,
                            'unit_price' => $price,
                            'subtotal' => $subtotal,
                            'tax_rate' => 0,
                            'tax_amount' => 0,
                            'total' => $subtotal,
                            'sort_order' => $index,
                        ]);
                        $count++;
                    }
                } catch (\Exception $e) {
                    $this->error("Error processing {$label} ID {$document->id}: {$e->getMessage()}");
                }
            }
            $this->info("Migrated {$count} line items for {$label}.");
        }

        $this->info('Migration completed successfully!');
    }
}
