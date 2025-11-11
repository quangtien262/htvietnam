<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsCurrency;
use App\Models\Whmcs\WhmcsTaxRule;
use App\Models\Whmcs\WhmcsPromoCode;
use Illuminate\Http\Request;

class WhmcsSettingController extends Controller
{
    public function apiCurrencies()
    {
        try {
            $currencies = WhmcsCurrency::orderBy('code', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $currencies
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiTaxRules()
    {
        try {
            $taxRules = WhmcsTaxRule::orderBy('name', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $taxRules
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiPromoCodes(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $status = $request->input('status', '');

            $query = WhmcsPromoCode::query();

            if ($search) {
                $query->where('code', 'like', "%{$search}%");
            }

            if ($status == 'active') {
                $query->where('start_date', '<=', now())
                    ->where(function ($q) {
                        $q->whereNull('expiry_date')
                            ->orWhere('expiry_date', '>=', now());
                    })
                    ->where(function ($q) {
                        $q->where('max_uses', 0)
                            ->orWhereRaw('uses < max_uses');
                    });
            } elseif ($status == 'expired') {
                $query->where('expiry_date', '<', now());
            }

            $promoCodes = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $promoCodes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
