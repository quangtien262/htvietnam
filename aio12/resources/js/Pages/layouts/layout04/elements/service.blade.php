<section class="section tai-sao" id="section_1252048194">
    <div class="bg section-bg fill bg-fill  ">
        <div class="section-bg-overlay absolute fill"></div>
    </div>
    <div class="section-content relative">
        @php
            $blockInfo = app('Helper')->getBlockInfo([], 1);
            $blocks = app('Helper')->getBlock([], 0);
        @endphp
        <div class="row" id="row-1818269927">
            <div class="col small-12 large-12">
                <div class="col-inner dark" style="padding:0px 0px 0px 0px;margin:0px 0px 0px 0px;">
                    <h3 class="title" style="text-align: center;">{{ $blockInfo->name ?? '' }}</h3>
                    <div class="inside big" style="text-align: center;">
                        {!! $blockInfo->description ?? '' !!}
                    </div>
                </div>
            </div>
            @foreach ($blocks as $service)
                <div class="col medium-3 small-12 large-3">
                    <div class="col-inner dark">
                        <div class="icon-box featured-box icon-box-center text-center">
                            <div class="icon-box-img" style="width: 60px">
                                <div class="icon">
                                    <div class="icon-inner">
                                        <img width="100" height="100" src="{{ $service->image }}"
                                            class="attachment-medium size-medium" />
                                    </div>
                                </div>
                            </div>
                            <div class="icon-box-text last-reset">
                                <h3 style="text-align: center;">{{ $service->name }}</h3>
                                <p style="text-align: center;">{{ $service->description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
    <style scope="scope">
        #section_1252048194 {
            padding-top: 20px;
            padding-bottom: 20px;
        }

        #section_1252048194 .section-bg-overlay {
            background-color:#37b5ffc2;
        }

        #section_1252048194 .section-bg.bg-loaded {
            background-image: url(/layouts/layout04/images/wallhaven-251394.png);
        }
    </style>
</section>
