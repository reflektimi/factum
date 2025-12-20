<?php

namespace App\Http\Controllers;

use App\Services\CashFlowForecastService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Artisan;

class ForecastController extends Controller
{
    /**
     * Generate cash flow forecast for the current user
     */
    public function generateCashFlow(Request $request)
    {
        $months = $request->input('months', 12);
        
        try {
            $service = new CashFlowForecastService(Auth::user());
            $forecasts = $service->generateForecast($months);
            
            return back()->with('success', sprintf('Cash flow forecast generated successfully for the next %d months.', $months));
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to generate cash flow forecast: ' . $e->getMessage());
        }
    }

    /**
     * Generate financial insights for the current user
     */
    public function generateInsights(Request $request)
    {
        try {
            // Use the FinancialIntelligenceService directly
            $service = new \App\Services\FinancialIntelligenceService(Auth::user());
            $insights = $service->generateInsights();
            $service->checkCashFlowWarnings();
            
            return back()->with('success', sprintf('%d financial insights generated successfully.', count($insights)));
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to generate financial insights: ' . $e->getMessage());
        }
    }

    /**
     * Refresh all data (both forecasts and insights)
     */
    public function refreshAll(Request $request)
    {
        try {
            // Generate forecasts
            $forecastService = new CashFlowForecastService(Auth::user());
            $forecasts = $forecastService->generateForecast(12);
            
            // Generate insights
            $insightsService = new \App\Services\FinancialIntelligenceService(Auth::user());
            $insights = $insightsService->generateInsights();
            $insightsService->checkCashFlowWarnings();
            
            return back()->with('success', sprintf('Dashboard refreshed! Generated 12-month forecast and %d insights.', count($insights)));
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to refresh dashboard data: ' . $e->getMessage());
        }
   }
}
