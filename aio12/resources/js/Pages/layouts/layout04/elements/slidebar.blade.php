<section class="section slider-section" id="section_1641089328" style="padding: 0px !important;">
    <div class="bg section-bg fill bg-fill  bg-loaded">
    </div>
    <div class="section-content relative">
        <div class="row row-small" id="row-1784034671">
            <div class="col medium-12 small-12 large-12" style="padding: 0 !important;">
                <div class="col-inner">
                    <style scope="scope">
                        #image_1461122873 {
                            width: 600px ; /* Change this value to the desired width */
                            max-width: 100%; /* Ensure it is responsive */
                        }
                    </style>
                    <div class="slider-wrapper relative" id="slider-2035437239">
                        <div class="slider slider-nav-circle slider-nav-large slider-nav-light slider-style-normal sld"
                            data-flickity-options='{
                     "cellAlign": "center",
                     "imagesLoaded": true,
                     "lazyLoad": 1,
                     "freeScroll": false,
                     "wrapAround": true,
                     "autoPlay": 5000,
                     "pauseAutoPlayOnHover" : true,
                     "prevNextButtons": true,
                     "contain" : true,
                     "adaptiveHeight" : true,
                     "dragThreshold" : 10,
                     "percentPosition": true,
                     "pageDots": true,
                     "rightToLeft": false,
                     "draggable": true,
                     "selectedAttraction": 0.1,
                     "parallax" : 0,
                     "friction": 0.6        }'>
                            @foreach ($images as $image)
                                @if ($image->type == '1')
                                    <div class="img has-hover x md-x lg-x y md-y lg-y" style=""  id="image_1461122873">
                                        <div class="img-inner image-cover img-slide dark" style="padding-top:333px;">
                                            <img width="100%" height="100%" src="{{ $image->image }}"
                                                class="attachment-large size-large" alt=""
                                                srcset="{{ $image->image }} "
                                                sizes="(max-width: 1280px) 500vw, 1280px" />
                                        </div>
                                        <style scope="scope">
                                            #image_1461122873 {
                                                width: 100%;
                                            }
                                        </style>
                                    </div>
                                @endif
                            @endforeach
                        </div>
                        <div class="loading-spin dark large centered"></div>
                        <style scope="scope">
                        </style>
                    </div>
                    <div class="row row-small hide-for-small" id="row-527692867">
                        @foreach ($images as $banner)
                            @if ($banner->type == 'banner')
                                <div class="col medium-6 small-12 large-6">
                                    <div class="col-inner">
                                        <div class="img has-hover x md-x lg-x y md-y lg-y" id="image_520641051">
                                            <div class="img-inner image-cover dark" style="padding-top:220px;">
                                                <img width="1020" height="518" src="{{ $banner->image }}"
                                                    class="attachment-large size-large" alt=""
                                                    sizes="(max-width: 1020px) 100vw, 1020px" />
                                            </div>
                                            <style scope="scope">
                                                #image_520641051 {
                                                    width: 100%;
                                                }
                                            </style>
                                        </div>
                                    </div>
                                </div>
                            @endif
                        @endforeach


                        <style scope="scope">
                        </style>
                    </div>
                </div>
            </div>

            <style scope="scope">
            </style>
        </div>
    </div>
    {{-- <style scope="scope">
        #section_1641089328 {
            padding-top: 20px;
            padding-bottom: 20px;
            /* background-color: rgb(241, 241, 241); */
        }
    </style> --}}
</section>
