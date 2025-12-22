<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class SettingController extends Controller
{
    /**
     * Display the settings page
     */
    public function index()
    {
        // Get or create settings for current user
        $settings = Setting::firstOrCreate(
            ['user_id' => Auth::id()],
            [
                'company_name' => 'My Company',
                'email' => Auth::user()->email,
                'primary_color' => '#3b82f6',
                'currencies' => ['USD'],
                'tax_rules' => []
            ]
        );
        
        // Convert logo_path to full URL for cross-domain access
        if ($settings->logo_path) {
            $settings->logo_path = url($settings->logo_path);
        }
        
        return response()->json([
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'primary_color' => 'nullable|string',
            'bank_details' => 'nullable|string',
            'logo' => 'nullable|image|max:5120', // Increased to 5MB
            'currencies' => 'nullable|array',
            'tax_rules' => 'nullable|array',
        ]);
        
        $settings = Setting::where('user_id', Auth::id())->firstOrFail();
        
        // Use only validated data, excluding 'logo' (handled separately)
        $data = collect($validated)->except(['logo'])->toArray();

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('logos', 'public');
            $data['logo_path'] = '/storage/' . $path;
        }

        $settings->update($data);
        
        // Refresh and convert logo_path to full URL
        $settings = $settings->fresh();
        if ($settings->logo_path) {
            $settings->logo_path = url($settings->logo_path);
        }
        
        return response()->json([
            'message' => 'Settings updated successfully.',
            'settings' => $settings,
        ]);
    }
}
