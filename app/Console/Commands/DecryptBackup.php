<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BackupService;
use Exception;

class DecryptBackup extends Command
{
    protected $signature = 'backup:decrypt {file : The encrypted backup file path} {destination? : The destination path for the decrypted zip}';
    protected $description = 'Decrypt a backup file using the stored encryption key';

    public function handle(BackupService $backupService)
    {
        $file = $this->argument('file');
        $destination = $this->argument('destination') ?? str_replace('.enc', '.zip', $file);

        if (!file_exists($file)) {
            $this->error("File not found: $file");
            return Command::FAILURE;
        }

        try {
            $this->info("Decrypting {$file}...");
            $backupService->decrypt($file, $destination);
            $this->info("Decryption successful!");
            $this->info("Restored to: {$destination}");
        } catch (Exception $e) {
            $this->error("Decryption failed: " . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
