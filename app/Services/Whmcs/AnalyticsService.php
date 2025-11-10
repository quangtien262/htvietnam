<?php

namespace App\Services\Whmcs;

use App\Models\Whmcs\Invoice;
use App\Models\Whmcs\Service;
use App\Models\Whmcs\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsService
{
    /**
     * Get revenue overview
     */
    public function getRevenueOverview(array $params = []): array
    {
        $startDate = $params['start_date'] ?? now()->startOfMonth();
        $endDate = $params['end_date'] ?? now()->endOfMonth();
        $compareStart = $params['compare_start'] ?? now()->subMonth()->startOfMonth();
        $compareEnd = $params['compare_end'] ?? now()->subMonth()->endOfMonth();

        // Current period revenue
        $currentRevenue = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->sum('total');

        // Previous period revenue
        $previousRevenue = Invoice::whereBetween('created_at', [$compareStart, $compareEnd])
            ->where('status', 'paid')
            ->sum('total');

        // Calculate growth
        $growth = $previousRevenue > 0 
            ? (($currentRevenue - $previousRevenue) / $previousRevenue) * 100 
            : 0;

        // Outstanding revenue (unpaid invoices)
        $outstandingRevenue = Invoice::where('status', 'unpaid')
            ->sum('total');

        // Monthly recurring revenue (MRR)
        $mrr = Service::where('status', 'active')
            ->where('payment_cycle', 'monthly')
            ->sum('recurring_amount');

        return [
            'current_revenue' => $currentRevenue,
            'previous_revenue' => $previousRevenue,
            'growth_percentage' => round($growth, 2),
            'outstanding_revenue' => $outstandingRevenue,
            'mrr' => $mrr,
            'arr' => $mrr * 12, // Annual Recurring Revenue
        ];
    }

    /**
     * Get revenue by time period (daily, weekly, monthly)
     */
    public function getRevenueByPeriod(string $period = 'daily', int $days = 30): array
    {
        $format = match($period) {
            'daily' => '%Y-%m-%d',
            'weekly' => '%Y-%W',
            'monthly' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $data = Invoice::where('status', 'paid')
            ->where('created_at', '>=', now()->subDays($days))
            ->select(
                DB::raw("DATE_FORMAT(created_at, '{$format}') as period"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as invoice_count')
            )
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        return $data->toArray();
    }

    /**
     * Get top customers by revenue
     */
    public function getTopCustomers(int $limit = 10): array
    {
        return User::select('users.id', 'users.name', 'users.email')
            ->join('whmcs_invoices', 'whmcs_invoices.client_id', '=', 'users.id')
            ->where('whmcs_invoices.status', 'paid')
            ->groupBy('users.id', 'users.name', 'users.email')
            ->selectRaw('SUM(whmcs_invoices.total) as total_revenue')
            ->selectRaw('COUNT(whmcs_invoices.id) as invoice_count')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get service statistics
     */
    public function getServiceStats(): array
    {
        $total = Service::count();
        $active = Service::where('status', 'active')->count();
        $pending = Service::where('status', 'pending')->count();
        $suspended = Service::where('status', 'suspended')->count();
        $terminated = Service::where('status', 'terminated')->count();

        return [
            'total' => $total,
            'active' => $active,
            'pending' => $pending,
            'suspended' => $suspended,
            'terminated' => $terminated,
            'active_percentage' => $total > 0 ? round(($active / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get churn rate (cancelled services)
     */
    public function getChurnRate(int $months = 6): array
    {
        $data = [];
        
        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            // Active services at start of month
            $activeStart = Service::where('registration_date', '<=', $startOfMonth)
                ->whereNull('termination_date')
                ->orWhere('termination_date', '>', $startOfMonth)
                ->count();

            // Services terminated during month
            $terminated = Service::whereBetween('termination_date', [$startOfMonth, $endOfMonth])
                ->count();

            $churnRate = $activeStart > 0 ? ($terminated / $activeStart) * 100 : 0;

            $data[] = [
                'month' => $month->format('Y-m'),
                'active_start' => $activeStart,
                'terminated' => $terminated,
                'churn_rate' => round($churnRate, 2),
            ];
        }

        return $data;
    }

    /**
     * Get payment method distribution
     */
    public function getPaymentMethodStats(): array
    {
        return Transaction::where('status', 'success')
            ->select('gateway')
            ->selectRaw('COUNT(*) as count')
            ->selectRaw('SUM(amount) as total_amount')
            ->groupBy('gateway')
            ->orderByDesc('total_amount')
            ->get()
            ->toArray();
    }

    /**
     * Get invoice statistics
     */
    public function getInvoiceStats(): array
    {
        $total = Invoice::count();
        $paid = Invoice::where('status', 'paid')->count();
        $unpaid = Invoice::where('status', 'unpaid')->count();
        $cancelled = Invoice::where('status', 'cancelled')->count();
        $overdue = Invoice::where('status', 'unpaid')
            ->where('due_date', '<', now())
            ->count();

        return [
            'total' => $total,
            'paid' => $paid,
            'unpaid' => $unpaid,
            'cancelled' => $cancelled,
            'overdue' => $overdue,
            'paid_percentage' => $total > 0 ? round(($paid / $total) * 100, 2) : 0,
        ];
    }

    /**
     * Get customer growth
     */
    public function getCustomerGrowth(int $months = 12): array
    {
        $data = [];
        
        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $startOfMonth = $month->copy()->startOfMonth();
            $endOfMonth = $month->copy()->endOfMonth();

            $newCustomers = User::whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            $totalCustomers = User::where('created_at', '<=', $endOfMonth)
                ->count();

            $data[] = [
                'month' => $month->format('Y-m'),
                'new_customers' => $newCustomers,
                'total_customers' => $totalCustomers,
            ];
        }

        return $data;
    }

    /**
     * Get product performance
     */
    public function getProductPerformance(): array
    {
        return Service::select('product_id')
            ->join('whmcs_products', 'whmcs_products.id', '=', 'whmcs_services.product_id')
            ->select('whmcs_products.id', 'whmcs_products.name')
            ->selectRaw('COUNT(whmcs_services.id) as service_count')
            ->selectRaw('SUM(whmcs_services.recurring_amount) as total_revenue')
            ->groupBy('whmcs_products.id', 'whmcs_products.name')
            ->orderByDesc('total_revenue')
            ->get()
            ->toArray();
    }

    /**
     * Get average order value
     */
    public function getAverageOrderValue(array $params = []): float
    {
        $startDate = $params['start_date'] ?? now()->startOfMonth();
        $endDate = $params['end_date'] ?? now()->endOfMonth();

        $totalRevenue = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->sum('total');

        $orderCount = Invoice::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'paid')
            ->count();

        return $orderCount > 0 ? round($totalRevenue / $orderCount, 2) : 0;
    }

    /**
     * Get lifetime value
     */
    public function getCustomerLifetimeValue(): array
    {
        $avgRevenue = User::join('whmcs_invoices', 'whmcs_invoices.client_id', '=', 'users.id')
            ->where('whmcs_invoices.status', 'paid')
            ->groupBy('users.id')
            ->selectRaw('AVG(total_revenue) as avg_ltv')
            ->from(DB::raw('(SELECT users.id, SUM(whmcs_invoices.total) as total_revenue FROM users JOIN whmcs_invoices ON whmcs_invoices.client_id = users.id WHERE whmcs_invoices.status = "paid" GROUP BY users.id) as subquery'))
            ->value('avg_ltv');

        return [
            'average_ltv' => round($avgRevenue ?? 0, 2),
        ];
    }

    /**
     * Export analytics data to CSV
     */
    public function exportData(string $type, array $params = []): string
    {
        $data = match($type) {
            'revenue' => $this->getRevenueByPeriod($params['period'] ?? 'daily', $params['days'] ?? 30),
            'customers' => $this->getTopCustomers($params['limit'] ?? 100),
            'services' => $this->getServiceStats(),
            'invoices' => $this->getInvoiceStats(),
            default => [],
        };

        // Convert to CSV format
        $csv = '';
        if (!empty($data)) {
            $headers = array_keys($data[0] ?? $data);
            $csv .= implode(',', $headers) . "\n";
            
            foreach ($data as $row) {
                $csv .= implode(',', $row) . "\n";
            }
        }

        return $csv;
    }
}
