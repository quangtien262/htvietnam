@extends('admin.layout')

@section('title', 'Dashboard Tài chính')

@section('content')
<div id="erp-dashboard-root"></div>
@endsection

@push('scripts')
@viteReactRefresh
@vite('resources/js/pages/erp/ERPDashboard.tsx')
@endpush
