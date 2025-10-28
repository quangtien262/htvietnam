import plugins from 'suneditor/src/plugins';
import SunEditor, { buttonList } from "suneditor-react";

export const optionSunEditor = {
    showPathLabel: false,
    minHeight: "300px",
    maxHeight: "5000px",
    placeholder: "Enter your text here!!!",
    // plugins: [
    //     align,
    //     font,
    //     fontColor,
    //     fontSize,
    //     formatBlock,
    //     hiliteColor,
    //     horizontalRule,
    //     lineHeight,
    //     list,
    //     paragraphStyle,
    //     table,
    //     template,
    //     textStyle,
    //     image,
    //     link,
    // ],
    plugins: plugins,
    buttonList: [
        ['undo', 'redo'],
        ['font', 'fontSize', 'formatBlock'],
        ['paragraphStyle', 'blockquote'],
        ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
        ['fontColor', 'hiliteColor', 'textStyle'],
        ['removeFormat'],
        '/', // Line break
        ['outdent', 'indent'],
        ['align', 'horizontalRule', 'list', 'lineHeight'],
        ['table', 'link', 'video', 'audio' /** ,'math' */], // You must add the 'katex' library at options to use the 'math' plugin.
        /** ['imageGallery'] */ // You must add the "imageGalleryUrl".
        ['image', 'imageGallery'],
        ['fullScreen', 'showBlocks', 'codeView'],
        ['preview', 'print'],
        ['save', 'template'],
        /** ['dir', 'dir_ltr', 'dir_rtl'] */ // "dir": Toggle text direction, "dir_ltr": Right to Left, "dir_rtl": Left to Right
    ],
    formats: ["p", "div", "h1", "h2", "h3", "h4", "h5", "h6"],
    font: [
        "Arial",
        "Calibri",
        "Comic Sans",
        "Courier",
        "Garamond",
        "Georgia",
        "Impact",
        "Lucida Console",
        "Palatino Linotype",
        "Segoe UI",
        "Tahoma",
        "Times New Roman",
        "Trebuchet MS",
    ],

    // get image
    imageGalleryUrl: route('file.all'),
    imageGalleryHeader:'Quản lý Dữ liệu',

    //upload
    imageResizing   : true, // Can resize the image.                               default: true {Boolean}
    imageHeightShow : true, // Choose whether the image height input is visible.   default: true {Boolean}
    imageAlignShow  : true, // Choose whether the image align radio buttons are visible.       default: true {Boolean}
    imageWidth      : 'auto', // The default width size of the image frame.          default: 'auto' {String}
    imageHeight     : 'auto', // The default height size of the image frame.         default: 'auto' {String}
    imageSizeOnlyPercentage : false, // If true, image size can only be scaled by percentage.   default: false {Boolean}

    // Choose whether to image rotation buttons display.
    // When "imageSizeOnlyPercentage" is "true" or  or "imageHeightShow" is "false" the default value is false.
    // If you want the button to be visible, put it a true.     default: true {Boolean}
    imageRotation   : true,

    imageFileInput  : true, // Choose whether to create a file input tag in the image upload window.  default: true {Boolean}
    imageUrlInput   : true, // Choose whether to create a image url input tag in the image upload window. If the value of imageFileInput is false, it will be unconditionally.   default: true {Boolean}
    imageUploadHeader : null, // Http Header when uploading images.              default: null {Object}


    // The image upload to server mapping address.       default: null {String}
    // (When not used the "imageUploadUrl" option, image is enters base64 data)
    // ex: "/editor/uploadImage"
    // request format: {
    //             "file-0": File,
    //             "file-1": File
    //         }
    // response format: {
    //             "errorMessage": "insert error message",
    //             "result": [
    //                 {
    //                     "url": "/download/editorImg/test_image.jpg",
    //                     "name": "test_image.jpg",
    //                     "size": "561276"
    //                 }
    //             ]
    //         }
    imageUploadUrl  : route('editor.upload'),

    imageUploadSizeLimit: null, // The size of the total uploadable images (in bytes).Invokes the "onImageUploadError" method.  default: null {Number}
    imageMultipleFile: true, // If true, multiple images can be selected.    default: false {Boolean}
    imageAccept      : '*', //Define the "accept" attribute of the input.  default: "*" {String} ex: "*" or ".jpg, .png .."


    // other
    previewTemplate: "<div style='width:auto; max-width:1080px; margin:auto;'><h1>Preview Template</h1> {{contents}} <div>_Footer_</div></div>",
    templates: [
        {
            name: 'Mẫu nội dung 01',
            html: '<p>HTML source1</p>'
        },
        {
            name: 'Mẫu nội dung 01',
            html: '<p>HTML source2</p>'
        }
      ]
};
