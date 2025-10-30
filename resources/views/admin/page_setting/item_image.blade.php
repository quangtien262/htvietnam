<div class="col-sm-12">
    <label for="{{ $key }}">
        <b>{{ $block[$key] }}</b>
        <span class="_red">*</span>
    </label>
    <input id="{{ $key }}" name="img[{{ $key }}]" value="" type="file" class="form-control required valid"/>
    <input type="hidden" value="{{ $landingpage->{$key} }}" name="data[{{ $key }}]"/>
    @if(!empty($landingpage->{$key}))
        <br/>
        <img class="img-land" src="{{ $landingpage->{$key} }}"/>
    @endif
    <br>
</div>
