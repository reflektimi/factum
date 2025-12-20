<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class UpdateCreditNoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'number' => [
                'required', 
                'string', 
                Rule::unique('credit_notes')->ignore($this->route('credit_note'))
            ],
            'customer_id' => [
                'required',
                Rule::exists('accounts', 'id')->where(fn ($q) => $q->where('user_id', Auth::id()))
            ],
            'invoice_id' => [
                'nullable',
                Rule::exists('invoices', 'id')->where(fn ($q) => $q->where('user_id', Auth::id()))
            ],
            'date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.price' => 'required|numeric|min:0',
            'status' => 'required|in:draft,sent,refunded',
            'notes' => 'nullable|string',
        ];
    }
}
