@if ($page->block_type == 'block05')

    @php
        $block05 = app('Helper')->getDataLang(
            'block05',
            ['block05.page_setting_id' => $page->data_id],
            ['block05.sort_order' => 'asc'],
        );
    @endphp
    <section class="section gioi-thieu-section section4 dark" id="section_2030097078"
        style="padding-top: 80px;padding-bottom: 80px;background-color: rgb(51, 51, 51);">

        {!! app('Helper')->editContent($page, 'block05', true) !!}

        <div class="bg section-bg fill bg-fill  bg-loaded">
        </div>
        <div class="section-content relative">
            <div class="row" id="row-2079117306">
                @foreach ($block05 as $block)
                    <div id="col-{{ $block->id }}" class="col cot1 medium-3 small-12 large-3">
                        <div class="col-inner text-center">
                            <p>
                                <span id="count{{ $block->id }}" class="display-4"
                                    style="font-size: 40px; color: #fcca03; font-weight: bold; font-family: "Open Sans",
                                    sans-serif; margin-bottom: 0;">
                                    {{ $block->note }}
                                </span>
                            </p>
                            <div class="item-text">
                                <p style="text-transform: uppercase">{{ $block->name_data }}</p>
                            </div>
                        </div>
                    </div>
                @endforeach

            </div>
        </div>
    </section>

@endif
