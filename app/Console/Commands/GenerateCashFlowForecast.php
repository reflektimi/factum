<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateCashFlowForecast extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'forecast:generate 
                            {--months=12 : Number of months to forecast} 
                            {--balance= : Override current cash balance}
                            {--fresh : Clear existing forecasts before generating}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate cash flow forecast for the next 12 months';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating cash flow forecasts for all users...');

        $months = (int) $this->option('months');
        $balance = $this->option('balance') ? (float) $this->option('balance') : null;

        if ($this->option('fresh')) {
            \App\Models\CashFlowForecast::where('generated_at', '>=', now()->subDay())->delete();
            $this->info('Cleared existing forecasts from last 24 hours.');
        }

        $users = \App\Models\User::all();
        $totalUsers = $users->count();
        $successCount = 0;

        foreach ($users as $index => $user) {
            $this->line(sprintf('[%d/%d] Processing forecast for user: %s (%s)', $index + 1, $totalUsers, $user->name, $user->email));
            
            $service = new \App\Services\CashFlowForecastService($user);
            
            try {
                $forecasts = $service->generateForecast($months, $balance);
                $successCount++;
                
                // Show brief summary for conservative scenario
                $conservative = $forecasts['conservative'] ?? [];
                if (!empty($conservative)) {
                    $finalMonth = end($conservative);
                    $this->info(sprintf('    ✓ %d-month forecast generated. Final balance: $%s', $months, number_format($finalMonth['projected_balance'], 2)));
                }
            } catch (\Exception $e) {
                $this->error(sprintf('    ✗ Error generating forecast for user %s: %s', $user->email, $e->getMessage()));
            }
        }

        $this->newLine();
        $this->info(sprintf('Forecast generation complete. Successfully processed %d out of %d users.', $successCount, $totalUsers));
        
        return Command::SUCCESS;
    }
}
