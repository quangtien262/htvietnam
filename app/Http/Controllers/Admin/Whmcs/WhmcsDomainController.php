<?php

namespace App\Http\Controllers\Admin\Whmcs;

use App\Http\Controllers\Controller;
use App\Models\Whmcs\WhmcsDomain;
use App\Models\Whmcs\WhmcsDomainTld;
use App\Services\Admin\WhmcsDomainService;
use Illuminate\Http\Request;

class WhmcsDomainController extends Controller
{
    protected $service;

    public function __construct(WhmcsDomainService $service)
    {
        $this->service = $service;
    }

    public function apiList(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 20);
            $search = $request->input('search', '');
            $status = $request->input('status', '');
            $clientId = $request->input('client_id', '');

            $query = WhmcsDomain::with(['client', 'tld']);

            if ($search) {
                $query->where('domain', 'like', "%{$search}%");
            }

            if ($status) {
                $query->where('status', $status);
            }

            if ($clientId) {
                $query->where('client_id', $clientId);
            }

            $domains = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $domains
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiDetail($id)
    {
        try {
            $domain = WhmcsDomain::with(['client', 'tld', 'addons'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $domain
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 404);
        }
    }

    public function apiAdd(Request $request)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'required|exists:whmcs_clients,id',
                'domain' => 'required|string|max:255',
                'tld_id' => 'required|exists:whmcs_domain_tlds,id',
                'registration_date' => 'required|date',
                'registration_period' => 'required|integer|min:1',
                'first_payment_amount' => 'required|numeric|min:0',
                'recurring_amount' => 'required|numeric|min:0',
                'registrar' => 'nullable|string',
                'status' => 'required|in:Pending,Active,Expired,Cancelled,Transferred,Fraud'
            ]);

            $validated['expiry_date'] = date('Y-m-d', strtotime($validated['registration_date'] . ' +' . $validated['registration_period'] . ' years'));
            $validated['next_due_date'] = $validated['expiry_date'];

            $domain = WhmcsDomain::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tạo tên miền thành công',
                'data' => $domain
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiUpdate(Request $request, $id)
    {
        try {
            $domain = WhmcsDomain::findOrFail($id);

            $validated = $request->validate([
                'registrar' => 'nullable|string',
                'status' => 'in:Pending,Active,Expired,Cancelled,Transferred,Fraud',
                'auto_renew' => 'boolean',
                'notes' => 'nullable|string'
            ]);

            $domain->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật tên miền thành công',
                'data' => $domain
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiRenew(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'renewal_period' => 'required|integer|min:1'
            ]);

            $domain = WhmcsDomain::findOrFail($id);
            $result = $this->service->renewDomain($domain, $validated['renewal_period']);

            return response()->json([
                'success' => true,
                'message' => 'Gia hạn tên miền thành công',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function apiTlds()
    {
        try {
            $tlds = WhmcsDomainTld::where('enabled', true)
                ->orderBy('tld', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $tlds
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
