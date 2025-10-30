<div class="col post-item">
    {!! app('Helper')->fastEdit('news', $item->id) !!}
    <div class="col-inner">
        <a href="{{ app('Helper')->getLinkNews($item) }}" class="plain">
            <div class="box box-normal box-text-bottom box-blog-post has-hover">
                <div class="box-image">
                    <div class="image-cover" style="padding-top:56.25%;">
                        <img width="300" height="150" src="{{ $item->image }}"
                            class="attachment-medium size-medium wp-post-image" alt="" />
                    </div>
                </div>
                <div class="box-text text-left">
                    <div class="box-text-inner blog-post-inner">
                        <h5 class="name-news">{{ $item->name }}</h5>
                        <div class="post-meta is-small op-8">{{ $item->updated_at->format('d/m/Y') }}</div>
                        <div class="is-divider"></div>
                    </div>
                </div>
            </div>
        </a>
    </div>
</div>
