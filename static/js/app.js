$(function() {
    console.log('Team 06');

    $('[data-toggle="popover"]').popover();
    $('[data-toggle="tooltip"]').tooltip();


    var $btnCopy = $('<button>')
        .addClass('btn btn-primary btn-xs pull-right')
        .html('<i class=\'fa fa-dedent\'></i>')
        .click(function(e) {
            var txtToCopy = $(this).parent()[0].innerText;
            console.log('To copy :', txtToCopy);
            // Copy the txt into the clipboard
            /*
            var made = document.execCommand("copy");
            if(made)
                alert('Copied in clipboard - press Ctrl-V to see the content');
            */
        });
/*
        $btnCopy.attr("data-toggle","popover")
        $btnCopy.attr("data-placement","top")
        $btnCopy.attr("data-content","Copied")
*/
    $(".to-copy").hover(function() {
        $(this).append($btnCopy); // Add the little btn to make the copy
        $btnCopy.show();
    }, function() {
        $btnCopy.hide();
    });


    $('.reset,.delete').click(function() {
        var $btn = $(this),
            $modal = $($btn.data('target'));

        $modal.find('.btn-confirm').attr('href', $btn.data("link"));
    });


    $('#btnToggleSecret').click(function (e) {
        var $btn = $(e.target),
            $wellSecret = $('.well'),
            start = nb = 7,
            str = $btn.text();
        $wellSecret.removeClass('hidden');
        $btn.removeClass('btn-info').addClass('btn-default disabled');
        var countDown = setInterval( (() =>  $btn.text(str + ' (' + nb-- + ')')),1000);

        setTimeout(function () {
            clearInterval(countDown);
            $btn.removeClass('btn-default disabled').addClass('btn-info');
            $wellSecret.addClass('hidden');
            $btn.text(str);
        }, start * 1000 );
    });




    var inputImg = document.getElementById('appImgLogo');
    var accepted = inputImg.getAttribute('accept').split(',');
    var appChosenLogo = document.getElementById('appChosenLogo');
    //var previewImg = document.getElementById('previewLogo');
    var previewImg = new window.Image();
    var file, fileDetails = document.getElementById('fileDetails');

    var canvas = document.getElementById('canv');
    var fileName = document.getElementById('fileName');
    var fileType = document.getElementById('fileType');
    var fileSize = document.getElementById('fileSize');
    var fileSrc = document.getElementById('fileSrc');


    if(appChosenLogo.value){
        previewImg.src = appChosenLogo.value;
        if (previewImg.complete)
            drawImage(previewImg);
    }


    inputImg.addEventListener("change", function() {
        // Get the chosen file
        file = this.files[0];
        file.humanSize = (file.size / 1024);

        previewImg.src = fileSrc.innerHTML = window.URL.createObjectURL(file);

        // [CHECK] Make a limit by size , if > 250 Kb => F#ck o#t
        if( file.humanSize > 250)
            return alert('Your logo is oversized (' + file.humanSize.toFixed(2) +') Kb. . The limit is set to 200 Kb.');

        //  [CHECK] Make a limit by type, if not in accept
        if(accepted.indexOf(file.type)<0)
            return alert('The logo\'s format is not allowed. Only JPEG');

        // What to do if the img is loaded
        if (previewImg.complete)
            drawImage(previewImg);
        else
            previewImg.onload =  (() => drawImage(previewImg));

        // Add details on the image
        fileDetails.className = 'dl-horizontal'
        fileSize.innerHTML = /*Math.floor*/ file.humanSize.toFixed(3) + ' Kb.';
        fileType.innerHTML = file.type;
        fileName.innerHTML = file.name;

    }, false);



    /**
     * Conserve aspect ratio of the orignal region. Useful when shrinking/enlarging
     * images to fit into a certain area.
     *  src : http://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
     *
     * @param {Object} dimension : contains the width and height of src and max.

     * @return {Object} { width, heigth } the src dimension * ratio
     */
    function calculateAspectRatioFit(dimension) {
        var ratio = Math.min(dimension.maxWidth / dimension.srcWidth, dimension.maxHeight / dimension.srcHeight);
        return {
            maxWidth: dimension.maxWidth, maxHeight: dimension.maxHeight ,
            width: dimension.srcWidth * ratio,
            height: dimension.srcHeight * ratio
        };
    }

    /**
     * description
     *
     */
    function drawImage(img) {
        // img = (typeof img === 'Event') ? this : img;
        var fit = calculateAspectRatioFit({
            maxWidth: 300,
            maxHeight: 250,
            srcWidth: img.width || 10,
            srcHeight: img.height || 10
        });
        canvas.className = ''
        var ctx = canvas.getContext("2d");
        canvas.width = fit.maxWidth;
        canvas.height = fit.maxWidth;
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);

        appChosenLogo.value = canvas.toDataURL('image/jpeg', 0.95);
        console.log(appChosenLogo.value);
    }
    
    
    function resetInitialLogo() {
        
    }


});
