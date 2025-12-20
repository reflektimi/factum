<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GenerateFinancialInsights extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'insights:generate {--fresh : Clear existing insights before generating new ones}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate financial insights from transaction data';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Generating financial insights for all users...');

        if ($this->option('fresh')) {
            \App\Models\FinancialInsight::where('is_dismissed', false)->delete();
            $this->info('Cleared existing insights.');
        }

        $users = \App\Models\User::all();
        $totalInsights = 0;

        foreach ($users as $user) {
            $this->line(sprintf('Processing insights for user: %s (%s)', $user->name, $user->email));
            
            $service = new \App\Services\FinancialIntelligenceService($user);
            
            try {
                $insights = $service->generateInsights();
                $service->checkCashFlowWarnings();
                
                $totalInsights += count($insights);
                $this->info(sprintf('  - Generated %d new insights.', count($insights)));
            } catch (\Exception $e) {
                $this->error(sprintf('  - Error generating insights for user %s: %s', $user->email, $e->getMessage()));
            }
        }

        $this->info(sprintf('Insight generation complete. Total new insights: %d', $totalInsights));
        
        return Command::SUCCESS;
    }
}
