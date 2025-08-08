<div id="button-contact-vr" class="">
    <div id="gom-all-in-one">
        <!-- Phone -->
        <div class="phone-bar phone-bar-n">
            <a href="tel:{{ $config->phone }}">
                <span class="text-phone">{{ $config->phone }}</span>
            </a>
        </div>
        <div id="phone-vr" class="button-contact">
            <div class="phone-vr">
                <div class="phone-vr-circle-fill"></div>
                <div class="phone-vr-img-circle">
                    <a href="tel:{{ $config->phone }}">
                        <img src="/images/icons/phone.png">
                    </a>
                </div>
            </div>
        </div>
        <!-- end phone -->
    </div>
    <!-- end v3 class gom-all-in-one -->
</div>

<div id="button-contact-vr" class=" btn-zalo-right">
    <div id="gom-all-in-one">
        <!-- v3 -->
        <!-- zalo -->
        <div id="zalo-vr" class="button-contact">
            <div class="phone-vr">
                <div class="phone-vr-circle-fill"></div>
                <div class="phone-vr-img-circle">
                    <a target="_blank" href="https://zalo.me/{{ $config->phone }}">
                        <img src="/images/icons/zalo.png">
                    </a>
                </div>
            </div>
        </div>
        <!-- end phone -->
    </div>
    <!-- end v3 class gom-all-in-one -->
</div>

<div id="button-contact-vr" class="messenger">
    <div id="gom-all-in-one">
        <!-- v3 -->
        <div id="zalo-vr" class="button-contact">
            <div class="phone-vr">
                <div class="phone-vr-circle-fill"></div>
                <div class="phone-vr-img-circle">
                    <a target="_blank" href="https://www.messenger.com/t/{{ $config->facebook_id }}">
                        <img src="/images/icons/messenger.png">
                    </a>
                </div>
            </div>
        </div>
    </div><!-- end v3 class gom-all-in-one -->
</div>

<style>
    /* icon FB messager */
#button-contact-vr.messenger {
    bottom: 0px;
    right: 0px;
}
#button-contact-vr {
    position: fixed;
    bottom: 0;
    z-index: 99999;
}
#gom-all-in-one .button-contact {
    transition: 1.6s all;
    -moz-transition: 1.6s all;
    -webkit-transition: 1.6s all;
}
#button-contact-vr .button-contact {
    position: relative;
    margin-top: -5px;
}
#button-contact-vr .button-contact .phone-vr {
    position: relative;
    visibility: visible;
    background-color: transparent;
    width: 90px;
    height: 90px;
    cursor: pointer;
    z-index: 11;
    -webkit-backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transition: visibility .5s;
    left: 0;
    bottom: 0;
    display: block;
}
#zalo-vr .phone-vr-circle-fill {
    box-shadow: 0 0 0 0 #2196F3;
    background-color: rgba(33, 150, 243, 0.7);
}
.phone-vr-circle-fill {
    width: 65px;
    height: 65px;
    top: 12px;
    left: 12px;
    position: absolute;
    box-shadow: 0 0 0 0 #c31d1d;
    background-color: rgba(230, 8, 8, 0.7);
    border-radius: 50%;
    border: 2px solid transparent;
    -webkit-animation: phone-vr-circle-fill 2.3s infinite ease-in-out;
    animation: phone-vr-circle-fill 2.3s infinite ease-in-out;
    transition: all .5s;
    -webkit-transform-origin: 50% 50%;
    -ms-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
    -webkit-animuiion: zoom 1.3s infinite;
    animation: zoom 1.3s infinite;
}
#zalo-vr .phone-vr-img-circle {
    background-color: #2196F3;
}
.phone-vr-img-circle {
    background-color: #e60808;
    width: 40px;
    height: 40px;
    line-height: 40px;
    top: 25px;
    left: 25px;
    position: absolute;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    -webkit-animation: phonering-alo-circle-img-anim 1s infinite ease-in-out;
    animation: phone-vr-circle-fill 1s infinite ease-in-out;
}
.phone-vr-img-circle a {
    display: block;
    line-height: 37px;
}
.phone-vr-img-circle img {
    max-height: 25px;
    max-width: 27px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    -moz-transform: translate(-50%,-50%);
    -webkit-transform: translate(-50%,-50%);
    -o-transform: translate(-50%,-50%);
}

/* zalo */
#button-contact-vr {
    position: fixed;
    bottom: 0;
    z-index: 100;
}
#gom-all-in-one .button-contact {
    transition: 1.6s all;
    -moz-transition: 1.6s all;
    -webkit-transition: 1.6s all;
}
#button-contact-vr .button-contact {
    position: relative;
    margin-top: -5px;
}
#button-contact-vr .button-contact .phone-vr {
    position: relative;
    visibility: visible;
    background-color: transparent;
    width: 90px;
    height: 90px;
    cursor: pointer;
    z-index: 11;
    -webkit-backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transition: visibility .5s;
    left: 0;
    bottom: 0;
    display: block;
}
#zalo-vr .phone-vr-circle-fill {
    box-shadow: 0 0 0 0 #2196F3;
    background-color: rgba(33, 150, 243, 0.7);
}
.phone-vr-circle-fill {
    width: 65px;
    height: 65px;
    top: 12px;
    left: 12px;
    position: absolute;
    box-shadow: 0 0 0 0 #c31d1d;
    background-color: rgba(230, 8, 8, 0.7);
    border-radius: 50%;
    border: 2px solid transparent;
    -webkit-animation: phone-vr-circle-fill 2.3s infinite ease-in-out;
    animation: phone-vr-circle-fill 2.3s infinite ease-in-out;
    transition: all .5s;
    -webkit-transform-origin: 50% 50%;
    -ms-transform-origin: 50% 50%;
    transform-origin: 50% 50%;
    -webkit-animuiion: zoom 1.3s infinite;
    animation: zoom 1.3s infinite;
}
#zalo-vr .phone-vr-img-circle {
    background-color: #2196F3;
}
.phone-vr-img-circle {
    background-color: #e60808;
    width: 40px;
    height: 40px;
    line-height: 40px;
    top: 25px;
    left: 25px;
    position: absolute;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    -webkit-animation: phonering-alo-circle-img-anim 1s infinite ease-in-out;
    animation: phone-vr-circle-fill 1s infinite ease-in-out;
}
.phone-vr-img-circle a {
    display: block;
    line-height: 37px;
}

a {
    transition: color .3s, background-color .3s, border-color .3s;
}
.phone-vr-img-circle img {
    max-height: 25px;
    max-width: 27px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    -moz-transform: translate(-50%,-50%);
    -webkit-transform: translate(-50%,-50%);
    -o-transform: translate(-50%,-50%);
}
#gom-all-in-one .button-contact {
    transition: 1.6s all;
    -moz-transition: 1.6s all;
    -webkit-transition: 1.6s all;
}
#button-contact-vr .button-contact {
    position: relative;
    margin-top: -5px;
}
.phone-bar a, #phone-vr .phone-vr-circle-fill, #phone-vr .phone-vr-img-circle, #phone-vr .phone-bar a {
    background-color: #dd3333;
}
.phone-bar a {
    bottom: 28px !important;
    padding: 4px 15px 5px 50px !important;
}
.phone-bar a {
    position: absolute;
    margin-top: -65px;
    left: 30px;
    z-index: -1;
    color: #fff;
    font-size: 16px;
    padding: 7px 15px 7px 50px;
    border-radius: 100px;
    white-space: nowrap;
}

@-webkit-keyframes phone-vr-circle-fill {
    0% {-webkit-transform: rotate(0) scale(1) skew(1deg);  }
    10% {-webkit-transform: rotate(-25deg) scale(1) skew(1deg);}
    20% {-webkit-transform: rotate(25deg) scale(1) skew(1deg);}
    30% {-webkit-transform: rotate(-25deg) scale(1) skew(1deg);}
    40% {-webkit-transform: rotate(25deg) scale(1) skew(1deg);}
    50% {-webkit-transform: rotate(0) scale(1) skew(1deg);}
    100% {-webkit-transform: rotate(0) scale(1) skew(1deg);}
  }
  @-webkit-keyframes zoom{0%{transform:scale(.9)}70%{transform:scale(1);box-shadow:0 0 0 15px transparent}100%{transform:scale(.9);box-shadow:0 0 0 0 transparent}}@keyframes zoom{0%{transform:scale(.9)}70%{transform:scale(1);box-shadow:0 0 0 15px transparent}100%{transform:scale(.9);box-shadow:0 0 0 0 transparent}}
  .phone-bar a {
      position: absolute;
      margin-top: -65px;
      left: 30px;
      z-index: -1;
      color: #fff;
      font-size: 16px;
      padding: 7px 15px 7px 50px;
      border-radius: 100px;
      white-space: nowrap;
  }

.btn-category {line-height: 27px;background: #c8def2;margin-right: 10px;margin-bottom: 7px;padding: 5px 10px;border-radius: 10px;}
.active.btn-category {
    background-color: #ff8609;
    color: #fff;
}
.btn-zalo-right {
    right: 0px;
    bottom: 80px !important;
}
/* end hotline */
</style>
