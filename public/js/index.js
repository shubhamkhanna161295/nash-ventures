var x;
$(document).ready(function () {
    makeTemplates();
    initApp();
})

function initApp() {
    console.log('started...');
    bind('.mainContainer .mainScreen .header .optionPane .searchTab', function () {
        $('.mainContainer .mainScreen .header .optionPane .search').removeClass('selected');
        $(this).addClass('selected');
        searchScreen();
    });
    bind('.mainContainer .mainScreen .header .optionPane .viewTab', function () {
        $('.mainContainer .mainScreen .header .optionPane .search').removeClass('selected');
        $(this).addClass('selected');
        viewScreen();
    });
    setTimeout(function () {
        $('.mainContainer .mainScreen .header .optionPane .searchTab').trigger(eventToUse);
    }, 300);
}


function searchScreen() {
    render('.contentContainer', 'search');
    bind('.mainContainer .mainScreen .contentContainer .tab1 .submitButton', function () {
        var keyword = $('.mainContainer .mainScreen .contentContainer .tab1 .searchKeyword').val().trim();
        console.log(keyword);
        var el = $(this);
        $(el).css('background', 'red');
        $(el).text('please wait');
        if (keyword != '') {
            execute('downloadImage', {
                keyword: keyword
            }, function () {
                $(el).css('background', '#2996cc');
                $(el).text('completed');
                setTimeout(function () {
                    $(el).text('submit');
                    $('.mainContainer .mainScreen .header .optionPane .viewTab').trigger(eventToUse);
                }, 2500);
                console.log('ALL IMAGES DOWNLOADED');
            });

            setTimeout(function () {
                $(el).css('background', '#2996cc');
                $(el).text('completed');
                setTimeout(function () {
                    $(el).text('submit');
                    $('.mainContainer .mainScreen .header .optionPane .viewTab').trigger(eventToUse);
                }, 2500);

            }, 50 * 1000);
        }
    })
}

function viewScreen() {
    execute('getData', {}, function (r) {
        console.log(r);
        var keywords = [];
        var temp = {};

        r.forEach(function (element) {
            if (temp[element.keyword] == undefined) {
                temp[element.keyword] = [];
            }

            temp[element.keyword].push(element);
        });

        for (var key in temp) {
            keywords.push({
                keyword: key,
                data: temp[key]
            });
        }

        console.log('final data');
        console.log(keywords);
        rb('.contentContainer', 'view', {
            data: keywords
        }, '', '.keywordsList', function (element, data) {
            console.log(data);
            $('.mainContainer .mainScreen .contentContainer .tab2 .leftPane .keywordsList').removeClass('selected');
            $(element).addClass('selected');
            render('.rightPane', 'image', data);
        });

        setTimeout(function () {
            $('.mainContainer .mainScreen .contentContainer .tab2 .leftPane .keywordsList[data-id=0]').trigger(eventToUse);
        }, 300);
    })

}