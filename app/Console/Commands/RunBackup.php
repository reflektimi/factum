<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BackupService;
use Exception;

class RunBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run a full system backup (Database + Files) with encryption';

    /**
     * Execute the console command.
     */
    public function handle(BackupService $backupService)
    {
        $this->info('Starting backup process...');

        try {
            $startTime = microtime(true);
            
            $result = $backupService->run();
            
            $duration = round(microtime(true) - $startTime, 2);

            $this->info("Backup completed successfully in {$duration}s!");
            $this->table(
                ['Attribute', 'Value'],
                [
                    ['File', $result['file']],
                    ['Hash (SHA256)', $result['hash']],
                    ['Size', $this->formatBytes($result['size'])],
                    ['Status', 'Encrypted & Stored']
                ]
            );

            // Optional: Send verify hash to user via log
            // Log::info("Backup {$result['hash']} created.");

        } catch (Exception $e) {
            $this->error('Backup failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    protected function formatBytes($bytes, $precision = 2) { 
        $units = array('B', 'KB', 'MB', 'GB', 'TB'); 
        
        $bytes = max($bytes, 0); 
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
        $pow = min($pow, count($units) - 1); 
        
        $bytes /= pow(1024, $pow); 
        
        return round($bytes, $precision) . ' ' . $units[$pow]; 
    }
}
