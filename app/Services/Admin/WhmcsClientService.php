<?php

namespace App\Services\Admin;

use App\Models\Whmcs\WhmcsClient;
use App\Models\Whmcs\WhmcsActivityLog;

class WhmcsClientService
{
    public function logActivity($clientId, $action, $description)
    {
        return WhmcsActivityLog::create([
            'client_id' => $clientId,
            'admin_user_id' => auth('admin')->id(),
            'action' => $action,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent()
        ]);
    }

    public function getClientServices($clientId)
    {
        $client = WhmcsClient::findOrFail($clientId);
        return $client->services()->with('product')->get();
    }

    public function getClientInvoices($clientId)
    {
        $client = WhmcsClient::findOrFail($clientId);
        return $client->invoices()->orderBy('created_at', 'desc')->get();
    }

    public function getClientBalance($clientId)
    {
        $client = WhmcsClient::findOrFail($clientId);
        $unpaidTotal = $client->invoices()->where('status', 'Unpaid')->sum('total');

        return [
            'credit' => $client->credit,
            'unpaid_invoices' => $unpaidTotal,
            'balance' => $client->credit - $unpaidTotal
        ];
    }
}
