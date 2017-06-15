var ihoey = ihoey || {};

var host = window.location.hostname,
    url = window.location.host + window.location.pathname,
    title = window.document.title,
    config = {
        authDomain: "ihoey.wilddog.com",
        syncURL: "https://ihoey.wilddogio.com"
    };
wilddog.initializeApp(config);

var provider = new wilddog.auth.QQAuthProvider();
var auth = wilddog.auth();

ihoey.cm = ihoey.cm || {};
ihoey.tool = ihoey.tool || {};

ihoey.cm.init = function() {
    ihoey.cm.onAuthStateChanged();
}

// var ref = wilddog.sync().ref('/' + ihoey.tool.palindrome(host));
// ref.set({
//     "full_name": "Steve Jobs",
//     "gender": "male"
// });

//判断登录
ihoey.cm.onAuthStateChanged = function(user) {
    auth.onAuthStateChanged(function(user) {
        if (user != null) {
            $('.logup').hide();
            if (user.providerId != 'anonymous') {
                $('.ihoey-visitor-name').text(user.displayName);
                $('.ihoey-avatar img').attr('src', user.photoURL);
            } else {
                $('.ihoey-visitor-name').text('匿名用户');
                $('.ihoey-avatar img').attr('src', 'https://sponsor.ihoey.com/images/like.svg');
            };
            $('.logout').show();
            $('.ihoey-visitor-name').show();
            //退出
            $('.logout').click(function() {
                auth.signOut().then(function() {
                    // 退出成功
                    window.location.reload()
                }).catch(function(error) {
                    // 发生错误
                    console.log("sign-out-error")
                })
            })
        } else {
            $('.logout').hide();
            // 直接使用 signInWithRedirect 会造成重复登录。
            // QQ登录
            $('.qq').click(function() {
                auth.signInWithRedirect(provider).then(function(user) {
                    console.log('登录了')
                }).catch(function(error) {
                    // 错误处理
                    console.log(error);
                    // ...
                })
            });
            //匿名登录
            $('.nm').click(function() {
                wilddog.auth().signInAnonymously().then(function(user) {
                    console.log(user);
                }).catch(function(error) {
                    // 错误处理
                    console.log(error);
                    // ...
                })
            })
        }
    })
}

//发布
$('.ihoey-post-button').click(function() {
    if ($('.ihoey-textarea-wrapper textarea').val() != '') {
        var ex = $('.ex li').clone();
        var text = $('textarea').val();
        $('textarea').val('');
        var time = new Date().format("yyyy年MM月dd日");
        var photoURL = $('.ihoey-replybox .ihoey-avatar img').attr('src');
        var nickName = $('.ihoey-visitor-name').text();
        console.log(ex);
        console.log(ex.find('.ihoey-avatar img'))
        ex.find('.ihoey-avatar img').attr('src', photoURL);
        ex.find('.ihoey-user-name').text(nickName);
        ex.find('.ihoey-time').text(time);
        ex.find('.ihoey-comment-body .text').text(text);
        ex.show();
        $('.ihoey-comments').append(ex);
    } else {
        alert('你还没有输入内容！')
    }
});


Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        //月份
        "d+": this.getDate(),
        //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
        //小时
        "H+": this.getHours(),
        //小时
        "m+": this.getMinutes(),
        //分
        "s+": this.getSeconihoey(),
        //秒
        "q+": Math.floor((this.getMonth() + 3) / 3),
        //季度
        "S": this.getMilliseconihoey() //毫秒
    };
    var week = {
        "0": "\u65e5",
        "1": "\u4e00",
        "2": "\u4e8c",
        "3": "\u4e09",
        "4": "\u56db",
        "5": "\u4e94",
        "6": "\u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

//工具
ihoey.tool.palindrome = function(str) {
    var newStr = str.toLowerCase().replace(/[^A-Za-z0-9]/g, "");
    return newStr;
}
