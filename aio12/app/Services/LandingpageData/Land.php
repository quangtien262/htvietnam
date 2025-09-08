<?php

namespace App\Services\LandingpageData;

use Exception;

class Land
{
    const PAGE_DEFAULT = [
        // all
        'name' => false,
        'images' => false,
        'image' => false,
        'link' => false,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => true,
        'content' => true,
    ];

    const PAGE_ALL = [
        // all
        'name' => false,
        'images' => true,
        'image' => false,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => true,
        'icon' => true,
        // lang
        'name_data' => true,
        'title_description' => true,
        'description' => true,
        'content' => true,
    ];

    const PAGE_NONE = [
        // all
        'name' => false,
        'images' => false,
        'image' => false,
        'link' => false,
        'active' => false,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => false,
        'content' => false,
    ];

    const PAGE_IMAGE_DATA = [
        // all
        'name' => false,
        'images' => false,
        'image' => true,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => true,
        'content' => true,
    ];

    const PAGE_IMAGES_DATA = [
        // all
        'name' => false,
        'images' => true,
        'image' => false,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => true,
        'content' => true,
    ];

    const PAGE_IMAGE = [
        // all
        'name' => false,
        'images' => false,
        'image' => true,
        'link' => true,
        'active' => false,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => false,
        'content' => false,
    ];

    const PAGE_IMAGES = [
        // all
        'name' => false,
        'images' => true,
        'image' => false,
        'link' => true,
        'active' => false,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => false,
        'content' => false,
    ];

    // BLOCK
    const BLOCK_DEFAULT = [
        // all
        'name' => false,
        'images' => false,
        'image' => false,
        'link' => false,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => true,
        'content' => true,
    ];


    const BLOCK_ALL = [
        // all
        'name' => false,
        'images' => true,
        'image' => false,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => true,
        'icon' => true,
        // lang
        'name_data' => true,
        'title_description' => true,
        'description' => true,
        'content' => true,
    ];

    const BLOCK_NONE = [
        // all
        'name' => false,
        'images' => false,
        'image' => false,
        'link' => false,
        'active' => false,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => false,
        'content' => false,
    ];
    const BLOCK_IMAGE = [
        // all
        'name' => false,
        'images' => false,
        'image' => true,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => false,
        'content' => false,
    ];
    const BLOCK_IMAGE_DATA = [
        // all
        'name' => false,
        'images' => false,
        'image' => true,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => true,
        'content' => true,
    ];
    const BLOCK_IMAGES = [
        // all
        'name' => false,
        'images' => true,
        'image' => false,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => false,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => false,
        'content' => false,
    ];

    const BLOCK_ICON = [
        // all
        'name' => false,
        'images' => false,
        'image' => false,
        'link' => true,
        'active' => true,
        'menu_id' => false,
        'note' => false,
        'icon' => true,
        // lang
        'name_data' => true,
        'title_description' => false,
        'images_data' => false,
        'description' => true,
        'content' => false,
    ];
}
