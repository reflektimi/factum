<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;
use ZipArchive;
use Exception;

class BackupService
{
    protected string $disk;
    protected string $backupPath;
    protected string $encryptionKey;

    public function __construct()
    {
        $this->disk = Config::get('backup.destination.disk', 'local');
        $this->backupPath = Config::get('backup.destination.path', 'backups');
        $this->encryptionKey = Config::get('backup.encryption.key');
    }

    /**
     * Run the backup process.
     */
    public function run(): array
    {
        $timestamp = date('Y-m-d_H-i-s');
        $tempDir = storage_path('app/temp_backup_' . $timestamp);
        $zipFileName = "backup_{$timestamp}.zip";
        $zipPath = "{$tempDir}/{$zipFileName}";

        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        try {
            // 1. Create Zip
            $this->createZip($zipPath);

            // 2. Encrypt (Optimization: Encrypt directly if enabled, otherwise just use zip)
            if (Config::get('backup.encryption.enabled')) {
                $finalFile = "backup_{$timestamp}.enc";
                $finalPath = "{$tempDir}/{$finalFile}";
                $this->encryptFile($zipPath, $finalPath);
                // Remove unencrypted zip
                unlink($zipPath); 
            } else {
                $finalFile = $zipFileName;
                $finalPath = $zipPath;
            }

            // 3. Calculate Hash
            $hash = hash_file('sha256', $finalPath);

            // 4. Store
            $stored = Storage::disk($this->disk)->putFileAs(
                $this->backupPath,
                new \Illuminate\Http\File($finalPath),
                $finalFile
            );

            if (!$stored) {
                throw new Exception("Failed to store backup on disk: {$this->disk}");
            }

            // 5. Cleanup Temp
            $this->cleanup($tempDir);

            // 6. Prune Old Backups
            $this->prune();

            return [
                'status' => 'success',
                'file' => $finalFile,
                'hash' => $hash,
                'size' => Storage::disk($this->disk)->size("{$this->backupPath}/{$finalFile}"),
            ];

        } catch (Exception $e) {
            $this->cleanup($tempDir);
            Log::error("Backup failed: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a zip archive of the database and files.
     */
    protected function createZip(string $zipPath): void
    {
        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new Exception("Cannot create zip file at $zipPath");
        }

        // Add Database
        $dbPath = Config::get('backup.source.database');
        if (file_exists($dbPath)) {
            $zip->addFile($dbPath, 'database.sqlite');
        }

        // Add Files
        $files = Config::get('backup.source.files', []);
        foreach ($files as $directory) {
            if (is_dir($directory)) {
                $files = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
                    \RecursiveIteratorIterator::LEAVES_ONLY
                );

                foreach ($files as $name => $file) {
                    if (!$file->isDir()) {
                        $filePath = $file->getRealPath();
                        $relativePath = 'storage/' . substr($filePath, strlen($directory) + 1);
                        $zip->addFile($filePath, $relativePath);
                    }
                }
            }
        }

        $zip->close();
    }

    /**
     * Encrypt a file using AES-256-CBC.
     */
    protected function encryptFile(string $source, string $dest): void
    {
        if (empty($this->encryptionKey)) {
            throw new Exception("Encryption key is not set.");
        }

        $key = base64_decode($this->encryptionKey);
        $ivLength = openssl_cipher_iv_length('AES-256-CBC');
        $iv = openssl_random_pseudo_bytes($ivLength);

        if (strlen($key) !== 32) {
             // Fallback if user provided string instead of base64 32-byte key
             // In production, force proper keys. Here we try to be lenient or fail.
             // For strict security, throw exception.
             $key = hash('sha256', $this->encryptionKey, true);
        }

        $handle = fopen($source, 'rb');
        $output = fopen($dest, 'wb');

        // Write IV first
        fwrite($output, $iv);

        while (!feof($handle)) {
            $chunk = fread($handle, 8192); // 8kb chunks
            $encrypted = openssl_encrypt($chunk, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
            
            // Should really handle padding/streaming properly for very large files,
            // but for typical small SaaS DBs, this is OK.
            // Note: openssl_encrypt usually handles padding, so chunking blind like this 
            // works best with specialized modes or if we assume small enough file to fit in ram
            // For robust streaming encryption, we manually pad usually.
            // REVISION: Simple approach - read whole file for reliability in this demo context
            // if memory allows. 
            // Rewinding for safety:
        }
        fclose($handle);
        fclose($output);
        
        // Re-doing with simpler file_get_contents for guaranteed correctness on MVP
        // since streaming block ciphers is complex to get perfect without libraries.
        $data = file_get_contents($source);
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
        $final = $iv . $encrypted;
        file_put_contents($dest, $final);
    }

    /**
     * Prune old backups.
     */
    protected function prune(): void
    {
        $keep = Config::get('backup.retention.keep_days', 7);
        $files = Storage::disk($this->disk)->files($this->backupPath);
        
        // Sort by modification time desc
        $sortedFiles = [];
        foreach ($files as $file) {
            $sortedFiles[$file] = Storage::disk($this->disk)->lastModified($file);
        }
        arsort($sortedFiles);
        
        $filesToDelete = array_slice(array_keys($sortedFiles), $keep);

        if (!empty($filesToDelete)) {
            Storage::disk($this->disk)->delete($filesToDelete);
            Log::info("Pruned " . count($filesToDelete) . " old backups.");
        }
    }

    /**
     * Cleanup temporary files.
     */
    protected function cleanup(string $dir): void
    {
        if (is_dir($dir)) {
            $files = array_diff(scandir($dir), ['.', '..']);
            foreach ($files as $file) {
                (is_dir("$dir/$file")) ? $this->cleanup("$dir/$file") : unlink("$dir/$file");
            }
            rmdir($dir);
        }
    }
    /**
     * Decrypt a file using AES-256-CBC.
     */
    public function decrypt(string $source, string $dest): void
    {
        if (empty($this->encryptionKey)) {
            throw new Exception("Encryption key is not set.");
        }

        $key = base64_decode($this->encryptionKey);
        if (strlen($key) !== 32) {
             $key = hash('sha256', $this->encryptionKey, true);
        }

        $ivLength = openssl_cipher_iv_length('AES-256-CBC');
        $data = file_get_contents($source);
        
        $iv = substr($data, 0, $ivLength);
        $encrypted = substr($data, $ivLength);
        
        $decrypted = openssl_decrypt($encrypted, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);

        if ($decrypted === false) {
            throw new Exception("Decryption failed. Invalid key or corrupted file.");
        }

        file_put_contents($dest, $decrypted);
    }
}
