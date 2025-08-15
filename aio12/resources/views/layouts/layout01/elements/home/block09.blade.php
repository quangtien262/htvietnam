@if ($page->block_type == 'block09')
@php
    $image = '';
    if (!empty($page->images) && !empty($page->images['avatar'])) {
        $image = $page->images['avatar'];
    }
@endphp
<section class="section" id="section_126874805">
    <div class="bg section-bg fill bg-fill bg-loaded">
    </div>
    <div class="section-content relative">
        <div class="row" id="row-246282350">
            
            <div id="col-596972795" class="col medium-7 small-12 large-7">
                <div class="col-inner">
                    <p>{{$page->description}}</p>
                    <h2><span style="font-size: 130%;">{{$page->name_data}}</span></h2>
                    <p>
                        {!! !empty($page->content) ? nl2br($page->content) : '' !!}
                    </p>
                    @if(!empty($page->link))
                        <a href="{{ $page->link }}" target="_self" class="button primary lowercase nut-xem-them">
                            <span>{{__('user.view_all')}}</span>
                        </a>
                    @endif
                </div>
            </div>

            <div id="col-858575644" class="col cot2 medium-5 small-12 large-5">
                <div class="col-inner">
                    <div class="img has-hover x md-x lg-x y md-y lg-y" id="image_{{ $page->id }}" style="width: 100%;">
                        <div class="img-inner dark">
                            <img decoding="async" width="800" height="562"
                                src="{{ $image }}"
                                class="attachment-original size-original" alt=""
                                srcset="{{ $image }} 800w, {{ $image }} 300w, {{ $image }} 768w, {{ $image }} 600w"
                                sizes="(max-width: 800px) 100vw, 800px">
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
    <style>
        #section_126874805 {
            padding-top: 80px;
            padding-bottom: 80px;
        }

        #section_126874805 .ux-shape-divider--top svg {
            height: 150px;
            --divider-top-width: 100%;
        }

        #section_126874805 .ux-shape-divider--bottom svg {
            height: 150px;
            --divider-width: 100%;
        }
    </style>
</section>
@endif