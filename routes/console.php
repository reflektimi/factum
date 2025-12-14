<?php

use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Log;

Schedule::command('backup:run')->daily()->at('03:00')->onFailure(function () {
    Log::error('Scheduled backup failed.');
});

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
