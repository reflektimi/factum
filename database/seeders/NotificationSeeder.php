<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\User;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

        foreach ($users as $user) {
            DB::table('notifications')->insert([
                [
                    'id' => Str::uuid(),
                    'type' => 'App\Notifications\InvoiceCreated',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'message' => 'New invoice INV-2024-001 created',
                        'action_url' => '/invoices/1',
                        'icon' => 'file-text', // for UI
                        'color' => 'blue'
                    ]),
                    'read_at' => null,
                    'created_at' => now()->subHours(2),
                    'updated_at' => now()->subHours(2),
                ],
                [
                    'id' => Str::uuid(),
                    'type' => 'App\Notifications\PaymentReceived',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'message' => 'Payment received of $5,000.00',
                        'action_url' => '/payments/1',
                        'icon' => 'credit-card',
                        'color' => 'green'
                    ]),
                    'read_at' => now()->subDays(1),
                    'created_at' => now()->subDays(1),
                    'updated_at' => now()->subDays(1),
                ],
                [
                    'id' => Str::uuid(),
                    'type' => 'App\Notifications\SystemAlert',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $user->id,
                    'data' => json_encode([
                        'message' => 'Backup completed successfully',
                        'action_url' => '/settings',
                        'icon' => 'check-circle',
                        'color' => 'gray'
                    ]),
                    'read_at' => null,
                    'created_at' => now()->subMinutes(30),
                    'updated_at' => now()->subMinutes(30),
                ]
            ]);
        }
    }
}
