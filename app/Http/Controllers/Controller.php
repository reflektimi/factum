<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function render($component, $props = [])
    {
        if (request()->wantsJson()) {
            return response()->json($props);
        }

        return \Inertia\Inertia::render($component, $props);
    }

    protected function success($message, $data = [], $redirectRoute = null, $redirectParams = [])
    {
        if (request()->wantsJson()) {
            return response()->json(array_merge([
                'message' => $message,
                'success' => true
            ], $data));
        }

        $redirect = $redirectRoute ? redirect()->route($redirectRoute, $redirectParams) : back();
        return $redirect->with('success', $message);
    }
}
