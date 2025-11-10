@extends('admin.layout')

@section('title', 'Quản lý tài khoản ngân hàng')

@section('content')
<div id="bank-account-root"></div>
@endsection

@push('scripts')
@viteReactRefresh
@vite('resources/js/pages/bank/BankAccountList.tsx')
@endpush
