<div class="col-12">
    @foreach($images as $img)
        <img src="{{ $img->image }}" class="img-thumbnail" alt="{{ $img->name }}">
        <br/><br/>
        <hr class="br-dot-b" />
    @endforeach
</div>
