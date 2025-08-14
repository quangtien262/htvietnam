<div id="top-bar" class="header-top hide-for-sticky nav-dark hide-for-medium">
    <div class="flex-row container">
        <div class="flex-col hide-for-medium flex-left">
            <ul class="nav nav-left medium-nav-center nav-small nav-">
                <li class="header-contact-wrapper">
                    <ul id="header-contact" class="nav nav-divided nav-uppercase header-contact">
                        <li class="">
                            <a href="mailto:{{$config->email}}" class="tooltip" title="{{$config->email}}">
                                <i class="icon-envelop" style="font-size:16px;"></i> <span>
                                    <span class="__cf_email__">{{$config->email}}xxxxxxxxx</span>
                                </span>
                            </a>
                        </li>
                        <li class="">
                            <a href="tel:{{$config->phone}}" class="tooltip" title="{{$config->phone}}">
                                <i class="icon-phone" style="font-size:16px;"></i> <span>{{$config->phone}}</span>
                            </a>
                        </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div class="flex-col hide-for-medium flex-center">
            <ul class="nav nav-center nav-small  nav-">
            </ul>
        </div>
        <div class="flex-col hide-for-medium flex-right">
            <ul class="nav top-bar-nav nav-right nav-small  nav-">
                <li class="html header-social-icons ml-0">
                    <div class="social-icons follow-icons">
                        <a href="{{$config->facebook_id}}" target="_blank" data-label="Facebook" rel="noopener noreferrer nofollow"
                            class="icon plain facebook tooltip" title="Follow on Facebook"
                            aria-label="Follow on Facebook"><i class="icon-facebook"></i>
                        </a>
                        <a href="{{$config->instagram}}" target="_blank" rel="noopener noreferrer nofollow" data-label="Instagram"
                            class="icon plain  instagram tooltip" title="Follow on Instagram"
                            aria-label="Follow on Instagram"><i class="icon-instagram"></i>
                        </a>
                        <a href="{{$config->instagram}}" target="_blank" data-label="Twitter" rel="noopener noreferrer nofollow"
                            class="icon plain  twitter tooltip" title="Follow on Twitter"
                            aria-label="Follow on Twitter"><i class="icon-twitter"></i>
                        </a>
                        <a href="mailto:{{$config->email}}"
                            data-label="E-mail" rel="nofollow" class="icon plain  email tooltip"
                            title="Send us an email" aria-label="Send us an email"><i class="icon-envelop"></i>
                        </a>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</div>