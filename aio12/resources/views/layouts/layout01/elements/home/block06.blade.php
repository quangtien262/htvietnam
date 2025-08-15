@if ($page->block_type == 'block06')

    @php
        $block06 = app('Helper')->getDataLang('block06', ['block06.page_setting_id' => $page->data_id], ['block06.sort_order' => 'asc']);
    @endphp
    <section class="section section5 dark" id="section_430949110">
        <div class="bg section-bg fill bg-fill  ">
        </div>
        <div class="section-content relative">
            <div class="row row-large" id="row-1676839841">
                <div id="col-1531429096" class="col hide-for-small medium-6 small-12 large-6">
                    <div class="col-inner">
                    </div>
                </div>

                <div id="col-1606264330" class="col medium-6 small-12 large-6">

                    <div class="col-inner">
                        <div class="tieu-de">
                            <p>{{ $page->description }}</p>
                            <h2>{{ $page->name_data }}</h2>
                        </div>
                        <p>
                            <span style="color: #ffffff; font-size: 90%;">{{ $page->content }}</span>
                        </p>
                        <div class="row row-small" id="row-1854211297">
                            @foreach ($block06 as $item)
                                <div class=" col medium-4 small-12 large-4">
                                    <div class="icon-box featured-box icon-box-top text-center">
                                        <div class="icon-box-img icon05">
                                            <div class="icon">
                                                <div class="icon-inner">
                                                   {!! $item->icon !!}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="icon-box-text last-reset">
                                            <h3>{{$item->name_data}}</h3>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            #section_430949110 {
                padding-top: 100px;
                padding-bottom: 100px;
                background-color: rgb(51, 51, 51);
            }

            #section_430949110 .section-bg.bg-loaded {
                background-image: url({{ !empty($page->images) && !empty($page->images['avatar']) ? $page->images['avatar'] : '' }});
            }

            #section_430949110 .ux-shape-divider--top svg {
                height: 150px;
                --divider-top-width: 100%;
            }

            #section_430949110 .ux-shape-divider--bottom svg {
                height: 150px;
                --divider-width: 100%;
            }
        </style>
    </section>
@endif
