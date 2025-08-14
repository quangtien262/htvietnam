@if ($page->block_type == 'doiTac')

@php
    $doiTac = app('Helper')->getDataByConditions('doi_tac', [], ['sort_order' => 'asc'], 20);
@endphp
<section class="section section9" id="section_356292301">
    <div class="bg section-bg fill bg-fill bg-loaded">
    </div>
    <div class="section-content relative">
        <div class="row align-middle" style="max-width:90%" id="row-1819301465">
            @foreach ($doiTac as $dt)
                <div id="col-1741527598" class="col medium-2 small-6 large-2">
                    <div class="col-inner">
                        <div class="img has-hover x md-x lg-x y md-y lg-y" id="image_1456280386" style="width: 100%;">
                            <div class="img-inner image-color dark">
                                <img loading="lazy" decoding="async" width="250" height="100"
                                    src="{{ $dt->image }}" class="attachment-original size-original"
                                    alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
    <style>
        #section_356292301 {
            padding-top: 40px;
            padding-bottom: 40px;
            background-color: rgb(252, 202, 3);
        }

        #section_356292301 .ux-shape-divider--top img {
            height: 150px;
            --divider-top-width: 100%;
        }

        #section_356292301 .ux-shape-divider--bottom img {
            height: 150px;
            --divider-width: 100%;
        }
    </style>
</section>

@endif