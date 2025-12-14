<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Backup Source
    |--------------------------------------------------------------------------
    |
    | The directories and files that should be included in the backup.
    |
    */
    'source' => [
        'files' => [
            storage_path('app/public'), // User uploads
        ],
        'database' => database_path('database.sqlite'), // SQLite file
    ],

    /*
    |--------------------------------------------------------------------------
    | Backup Destination
    |--------------------------------------------------------------------------
    |
    | The disk where backups should be stored. This should be configured
    | in your config/filesystems.php file.
    |
    */
    'destination' => [
        'disk' => env('BACKUP_DISK', 'local'),
        'path' => 'backups',
    ],

    /*
    |--------------------------------------------------------------------------
    | Retention Policy
    |--------------------------------------------------------------------------
    |
    | How many recent backups should be kept. Older backups will be
    | automatically pruned.
    |
    */
    'retention' => [
        'keep_days' => 7,
    ],

    /*
    |--------------------------------------------------------------------------
    | Encryption
    |--------------------------------------------------------------------------
    |
    | Secure your backups with AES-256 encryption.
    |
    */
    'encryption' => [
        'enabled' => true,
        'key' => env('BACKUP_ENCRYPTION_KEY'),
        'cipher' => 'AES-256-CBC',
    ],

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    |
    | Where to send backup notifications.
    |
    */
    'notifications' => [
        'mail' => [
            'to' => env('BACKUP_NOTIFICATION_EMAIL', 'admin@example.com'),
        ],
    ],
];
