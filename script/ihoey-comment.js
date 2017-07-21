var ihoey = ihoey || {};

var host = window.document.location.pathname,
    url = window.document.location.pathname,
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
ihoey.user = {};
var currentNode = '';

ihoey.cm.init = function() {
    ihoey.cm.onAuthStateChanged();
    ihoey.cm.savapageUrl();
}

var ref = wilddog.sync().ref('/blog/');

$.getScript('http://pv.sohu.com/cityjson?ie=utf-8', function(data, textStatus) {
    console.log(returnCitySN.cip, returnCitySN.cname)
});

ihoey.cm.sendPost = function() {
    ref.push({
        "title": title,
        "url": url,
        "sourceId": url,
        "ctime": new Date().getTime()
    });
}

//是否存在
var flag = false;
var currentNode = '';

//存储页面信息
ihoey.cm.savapageUrl = function () {
    ref.once('value').then(function(snapshot) {
        data = snapshot.val()
        for (var childSnapshot in data) {
            childData = data[childSnapshot];
            if (url == childData.url) {
                currentNode = childSnapshot
                ihoey.cm.render();
                flag = false
                return
            } else {
                flag = true
            }
        }
        if (flag == true) {
            ihoey.cm.sendPost()
            ihoey.cm.savapageUrl()
        } else {
            currentNode = currentNode;
        }
    })
}


//存储消息
ihoey.cm.sendMsg = function(time, content) {
    ref.child(currentNode).child('comments').push({
        "cid": "2661911273",
        "ctime": new Date().getTime(),
        "content": content,
        "pid": "0",
        "ip": returnCitySN.cip,
        "port": 0,
        "sc": "",
        "vote": 0,
        "against": 0,
        "anonymous": ihoey.user.isAnonymous,
        "user": {
            "userId": ihoey.user.uid,
            "nickname": ihoey.user.displayName || '梦魇小栈',
            "avatar": ihoey.user.photoURL || 'https://sponsor.ihoey.com/images/like.svg',
            "anonymous": ihoey.user.isAnonymous
        }
    });
}

//判断登录
ihoey.cm.onAuthStateChanged = function(user) {
    auth.onAuthStateChanged(function(user) {
        ihoey.user = user
        console.log(user, 2)
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
                    console.log(user);
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
        var content = $('textarea').val();
        $('textarea').val('');
        var time = new Date().format("yyyy年MM月dd日");
        var photoURL = $('.ihoey-replybox .ihoey-avatar img').attr('src');
        var nickName = $('.ihoey-visitor-name').text();
        console.log(ex);
        console.log(ex.find('.ihoey-avatar img'))
        ex.find('.ihoey-avatar img').attr('src', photoURL);
        ex.find('.ihoey-user-name').text(nickName);
        ex.find('.ihoey-time').text(time);
        ex.find('.ihoey-comment-body .text').text(content);
        ex.show();
        $('.ihoey-comments').append(ex);
        ihoey.cm.sendMsg(time, content);
    } else {
        alert('你还没有输入内容！')
    }
});

ihoey.cm.render = function() {
    ref.child(currentNode).child('comments').once('value', function(snapshot) {
        var info = snapshot.val();
        for (ele in info) {
            console.log()
            var ex = $('.ex li').clone();
            ex.find('.ihoey-avatar img').attr('src', info[ele].user.avatar);
            ex.find('.ihoey-user-name').text(info[ele].user.nickname);
            ex.find('.ihoey-time').text(info[ele].ctime);
            ex.find('.ihoey-comment-body .text').text(info[ele].content);
            ex.show();
            $('.ihoey-comments').append(ex);
        }
    });
}

//格式化时间
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
        "s+": this.getSeconds(),
        //秒
        "q+": Math.floor((this.getMonth() + 3) / 3),
        //季度
        "S": this.getMilliseconds() //毫秒
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


// setTimeout(function() {
//     ihoey.cm.render();
// }, 1600);
