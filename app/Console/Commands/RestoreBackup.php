<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BackupService;
use Illuminate\Support\Facades\Config;
use ZipArchive;
use Exception;

class RestoreBackup extends Command
{
    protected $signature = 'backup:restore {file : The encrypted backup file path}';
    protected $description = 'Restore the system database and files from a secure backup';

    public function handle(BackupService $backupService)
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("Backup file not found: $file");
            return Command::FAILURE;
        }

        if (!$this->confirm('⚠️  WARNING: This will OVERWRITE your current database and files. This action cannot be undone. Are you sure you want to proceed?', false)) {
            $this->info("Restoration cancelled.");
            return Command::SUCCESS;
        }

        $this->info("Starting restoration process...");
        $tempDir = storage_path('app/temp_restore_' . time());
        
        try {
            if (!is_dir($tempDir)) {
                mkdir($tempDir, 0755, true);
            }

            // 1. Decrypt
            $this->info("Step 1: Decrypting backup...");
            $zipPath = $tempDir . '/restored_backup.zip';
            $backupService->decrypt($file, $zipPath);

            // 2. Unzip and Inspect
            $this->info("Step 2: Extracting files...");
            $zip = new ZipArchive;
            if ($zip->open($zipPath) === TRUE) {
                $zip->extractTo($tempDir);
                $zip->close();
            } else {
                throw new Exception("Failed to open decrypted zip file.");
            }

            // 3. Restore Database
            $this->info("Step 3: Restoring Database...");
            $dbSource = $tempDir . '/database.sqlite';
            $dbTarget = Config::get('backup.source.database');
            
            if (file_exists($dbSource)) {
                // Determine target directory
                $targetDir = dirname($dbTarget);
                if (!is_dir($targetDir)) {
                    mkdir($targetDir, 0755, true);
                }
                
                // Copy with overwrite
                if (!copy($dbSource, $dbTarget)) {
                    throw new Exception("Failed to copy database file to $dbTarget");
                }
                $this->info("Database restored successfully.");
            } else {
                $this->warn("No database.sqlite found in backup package.");
            }

            // 4. Restore Storage Files
            $this->info("Step 4: Restoring Storage Files...");
            $storageSource = $tempDir . '/storage';
            $storageTarget = base_path('storage'); // Base storage path

            // Using pure PHP copy for directories is complex, 
            // but since we structured zip as 'storage/app/public/...', 
            // we can copy simply if we match structure.
            // Simplified logic: Copy contents recursively if they exist.
            
            if (is_dir($storageSource)) {
               $this->recursiveCopy($storageSource, $storageTarget);
               $this->info("Files restored successfully.");
            }

            $this->info("Disaster Recovery Completed! System is now running on backup state.");

        } catch (Exception $e) {
            $this->error("Restoration Failed: " . $e->getMessage());
            $this->cleanup($tempDir);
            return Command::FAILURE;
        }

        $this->cleanup($tempDir);
        return Command::SUCCESS;
    }

    protected function cleanup($dir) {
        if (!is_dir($dir)) return;
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            (is_dir("$dir/$file")) ? $this->cleanup("$dir/$file") : unlink("$dir/$file");
        }
        rmdir($dir);
    }

    protected function recursiveCopy($src, $dst) {
        $dir = opendir($src);
        @mkdir($dst);
        while(false !== ( $file = readdir($dir)) ) {
            if (( $file != '.' ) && ( $file != '..' )) {
                if ( is_dir($src . '/' . $file) ) {
                    $this->recursiveCopy($src . '/' . $file,$dst . '/' . $file);
                }
                else {
                    copy($src . '/' . $file,$dst . '/' . $file);
                }
            }
        }
        closedir($dir);
    }
}
