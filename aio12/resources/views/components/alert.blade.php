@if (isset($message['success']))
    <div class="alert alert-success">
        <p>{{ $message['success'] }}</p>
        <a class="btn btn-success" href="{{ route('home') }}">Quay về trang chủ</a>
    </div>
@endif

@if (isset($message['error']))
    <div class="alert alert-error">
        <p>{{ $message['error'] }}</p>
        <a class="btn btn-success" href="{{ route('home') }}">Quay về trang chủ</a>
    </div>
@endif

<style>
    .alert-success {
        background-color: #21bf60;
        color: #fff;
        line-height: 30px;
        padding-left: 10px;
        border-radius: 5px;
        text-align: center
    }

    .alert-error {
        background-color: #ff9393;
        color: #af0101;
        line-height: 37px;
        padding-left: 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        text-align: center
    }
</style>
