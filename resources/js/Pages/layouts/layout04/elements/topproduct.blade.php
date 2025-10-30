<div id="content" role="main" class="content-area">


    <section class="section san-pham" id="section_228465744">
        <div class="bg section-bg fill bg-fill  bg-loaded">
        </div>
        <div class="section-content relative">

            <div class="row" id="row-1699032303">
                <div class="col small-12 large-12 movi">
                    <div class="col-inner">
                        @foreach ($menu as $mn)
                            @php
                                $productByCategory = app('Helper')->getProductsByMenu($mn, 5);
                                if (count($productByCategory) == 0) {
                                    continue;
                                }
                            @endphp
                            <div class="heading">
                                <h2><a href="{{ app('Helper')->getLinkMenu($mn) }}"><img src="{{ $mn->image }}">
                                        {{ $mn->name }}</a></h2>

                            </div>
                            <div id="gap-1201639142" class="gap-element clearfix" style="display:block; height:auto;">
                                <style scope="scope">
                                    #gap-1201639142 {
                                        padding-top: 15px;
                                    }
                                </style>
                            </div>
                            <div
                                class="row large-columns-5 medium-columns-3 small-columns-2 row-small has-shadow row-box-shadow-1 row-box-shadow-2-hover">
                                @if ($productByCategory->count() > 0)
                                    @foreach ($productByCategory as $product)
                                        @include('layouts.layout04.elements.item_product')
                                    @endforeach

                            </div>
                        @endif
                        @endforeach
                    </div>
                </div>

            </div>

        </div>
        <style scope="scope">
            #section_228465744 {
                padding-top: 30px;
                padding-bottom: 30px;
            }

            @media screen and (max-width: 980px) {
                .movi {
                    padding-top: 50px
                }
            }
            @media screen and (max-width: 540px) {
                .movi {
                    padding-top: 150px
                }
            }
            @media screen and (max-width: 375px) {
                .movi {
                    padding-top: 50px !important;
                }
            }
            @media screen and (max-width: 390px) {
                .movi {
                    padding-top: 65px !important;
                }
            }
            @media screen and (max-width: 412px) {
                .movi {
                    padding-top: 70px !important;
                }
            }
            @media screen and (max-width: 768px) {
                .flickity-enabled.is-draggable .flickity-viewport{
                    height: 430px !important;
                }
                .movi {
                    padding-top: 150px
                }
            }
            @media screen and (max-width: 820px) {
                .flickity-enabled.is-draggable .flickity-viewport{
                    height: 470px !important;
                }

            }
            @media screen and (max-width: 912px) {
                .flickity-enabled.is-draggable .flickity-viewport{
                    height: 470px !important;
                }

            }
        </style>
    </section>




</div>
